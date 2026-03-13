const prisma = require('../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const where = { organizationId: req.user.organizationId, status: 'active' };
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const records = await prisma.record.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const total = await prisma.record.count({ where });
    res.json({ data: records, total, page: pageNumber, limit: pageSize });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const record = await prisma.record.findFirst({
      where: {
        id: Number(req.params.id),
        organizationId: req.user.organizationId
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const record = await prisma.record.create({
      data: {
        name: req.body.name,
        fatherName: req.body.fatherName,
        address: req.body.address,
        contact: req.body.contact,
        age: Number(req.body.age),
        disability: req.body.disability,
        advice: req.body.advice || null,
        remarks: req.body.remarks || null,
        imageUrl: req.body.imageUrl || null,
        imagePublicId: req.body.imagePublicId || null,
        organizationId: req.user.organizationId,
        status: req.body.status || 'active',
        tags: req.body.tags || [],
        createdById: req.user.id,
        lastUpdatedById: req.user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'record.create',
        entityType: 'Record',
        entityId: record.id,
        userId: req.user.id,
        recordId: record.id,
        ipAddress: req.ip,
        details: { name: record.name }
      }
    });

    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existingRecord = await prisma.record.findFirst({
      where: { id: Number(req.params.id), organizationId: req.user.organizationId }
    });

    if (!existingRecord) return res.status(404).json({ message: 'Record not found' });

    const record = await prisma.record.update({
      where: { id: Number(req.params.id) },
      data: {
        name: req.body.name ?? existingRecord.name,
        fatherName: req.body.fatherName ?? existingRecord.fatherName,
        address: req.body.address ?? existingRecord.address,
        contact: req.body.contact ?? existingRecord.contact,
        age: req.body.age !== undefined ? Number(req.body.age) : existingRecord.age,
        disability: req.body.disability ?? existingRecord.disability,
        advice: req.body.advice ?? existingRecord.advice,
        remarks: req.body.remarks ?? existingRecord.remarks,
        imageUrl: req.body.imageUrl ?? existingRecord.imageUrl,
        imagePublicId: req.body.imagePublicId ?? existingRecord.imagePublicId,
        status: req.body.status ?? existingRecord.status,
        tags: req.body.tags ?? existingRecord.tags,
        lastUpdatedById: req.user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'record.update',
        entityType: 'Record',
        entityId: record.id,
        userId: req.user.id,
        recordId: record.id,
        ipAddress: req.ip,
        details: { updatedFields: Object.keys(req.body) }
      }
    });

    res.json(record);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const existingRecord = await prisma.record.findFirst({
      where: { id: Number(req.params.id), organizationId: req.user.organizationId }
    });

    if (!existingRecord) return res.status(404).json({ message: 'Record not found' });

    await prisma.record.update({
      where: { id: Number(req.params.id) },
      data: { status: 'deleted', lastUpdatedById: req.user.id }
    });

    await prisma.auditLog.create({
      data: {
        action: 'record.delete',
        entityType: 'Record',
        entityId: Number(req.params.id),
        userId: req.user.id,
        recordId: Number(req.params.id),
        ipAddress: req.ip
      }
    });

    res.json({ message: 'Record deleted' });
  } catch (err) {
    next(err);
  }
};

exports.search = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const records = await prisma.record.findMany({
      where: {
        organizationId: req.user.organizationId,
        status: 'active',
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { fatherName: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const where = { organizationId: req.user.organizationId, status: 'active' };

    const [total, aggregates] = await Promise.all([
      prisma.record.count({ where }),
      prisma.record.aggregate({
        where,
        _avg: { age: true },
        _min: { age: true },
        _max: { age: true }
      })
    ]);

    const ageGroups = {
      '0-5': await prisma.record.count({ where: { organizationId: req.user.organizationId, status: 'active', age: { lte: 5 } } }),
      '6-10': await prisma.record.count({ where: { organizationId: req.user.organizationId, status: 'active', age: { gt: 5, lte: 10 } } }),
      '11-15': await prisma.record.count({ where: { organizationId: req.user.organizationId, status: 'active', age: { gt: 10, lte: 15 } } }),
      '15+': await prisma.record.count({ where: { organizationId: req.user.organizationId, status: 'active', age: { gt: 15 } } })
    };

    res.json({
      total,
      avgAge: aggregates._avg.age ?? 0,
      minAge: aggregates._min.age ?? 0,
      maxAge: aggregates._max.age ?? 0,
      ageGroups
    });
  } catch (err) {
    next(err);
  }
};

exports.getReviews = async (req, res, next) => {
  try {
    const recordId = Number(req.params.id);

    const record = await prisma.record.findFirst({
      where: {
        id: recordId,
        organizationId: req.user.organizationId
      },
      select: { id: true }
    });

    if (!record) return res.status(404).json({ message: 'Record not found' });

    const reviews = await prisma.$queryRaw`
      SELECT
        rr."id",
        rr."recordId",
        rr."userId",
        rr."rating",
        rr."comment",
        rr."createdAt",
        rr."updatedAt",
        u."id" as "user_id",
        u."name" as "user_name",
        u."email" as "user_email",
        u."role" as "user_role"
      FROM "RecordReview" rr
      LEFT JOIN "User" u ON u."id" = rr."userId"
      WHERE rr."recordId" = ${recordId}
      ORDER BY rr."createdAt" DESC
    `;

    res.json(
      reviews.map((row) => ({
        id: row.id,
        recordId: row.recordId,
        userId: row.userId,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        user: row.user_id
          ? {
              id: row.user_id,
              name: row.user_name,
              email: row.user_email,
              role: row.user_role
            }
          : null
      }))
    );
  } catch (err) {
    next(err);
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const recordId = Number(req.params.id);
    const comment = (req.body.comment || '').trim();
    const ratingValue = req.body.rating;
    const rating = ratingValue === undefined || ratingValue === null || ratingValue === ''
      ? null
      : Number(ratingValue);

    if (!comment) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const record = await prisma.record.findFirst({
      where: {
        id: recordId,
        organizationId: req.user.organizationId
      },
      select: { id: true }
    });

    if (!record) return res.status(404).json({ message: 'Record not found' });

    const inserted = await prisma.$queryRaw`
      INSERT INTO "RecordReview" ("recordId", "userId", "rating", "comment", "updatedAt")
      VALUES (${recordId}, ${req.user.id}, ${rating}, ${comment}, NOW())
      RETURNING "id", "recordId", "userId", "rating", "comment", "createdAt", "updatedAt"
    `;

    const review = {
      ...inserted[0],
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    };

    await prisma.auditLog.create({
      data: {
        action: 'record.review.create',
        entityType: 'RecordReview',
        entityId: review.id,
        userId: req.user.id,
        recordId,
        ipAddress: req.ip,
        details: { rating }
      }
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};