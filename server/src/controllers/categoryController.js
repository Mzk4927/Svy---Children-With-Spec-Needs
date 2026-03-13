const prisma = require('../config/database');

const DEFAULT_CATEGORIES = [
  'Imed Asst Req',
  'Medicine Referral',
  'Physio Referral',
  'Wheelchair',
  'Crutches',
  'Walker (Walking Frame)',
  'Walking Cane',
  'Prosthetic Leg (Artificial Leg)',
  'Prosthetic Arm (Artificial Arm)',
  'Hearing Aid',
  'Oxygen Cylinder',
  'Hospital Bed',
  'Stretcher',
  'Arm Sling',
  'Neck Collar (Cervical Collar)'
];

const ensureDefaultCategories = async () => {
  for (const categoryName of DEFAULT_CATEGORIES) {
    await prisma.$executeRaw`
      INSERT INTO "Category" ("name", "isSystem", "updatedAt")
      VALUES (${categoryName}, true, NOW())
      ON CONFLICT ("name") DO NOTHING
    `;
  }
};

exports.listCategories = async (req, res, next) => {
  try {
    await ensureDefaultCategories();

    const categories = await prisma.$queryRaw`
      SELECT "id", "name", "description", "isSystem", "createdById", "createdAt", "updatedAt"
      FROM "Category"
      ORDER BY "name" ASC
    `;

    res.json(categories);
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can create categories' });
    }

    const name = (req.body.name || '').trim();
    const description = (req.body.description || '').trim() || null;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const created = await prisma.$queryRaw`
      INSERT INTO "Category" ("name", "description", "isSystem", "createdById", "updatedAt")
      VALUES (${name}, ${description}, false, ${req.user.id}, NOW())
      ON CONFLICT ("name") DO NOTHING
      RETURNING "id", "name", "description", "isSystem", "createdById", "createdAt", "updatedAt"
    `;

    if (created.length === 0) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    res.status(201).json(created[0]);
  } catch (err) {
    next(err);
  }
};
