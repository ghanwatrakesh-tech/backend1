const Document = require('../models/Document');
const createLog = require('../utils/logger');

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        errorType: "VALIDATION_ERROR",
        message: "Files are required" 
      });
    }

    const uploadedDocs = [];

    for (const file of req.files) {
      // Validate file
      if (!file.filename || !file.path) {
        return res.status(400).json({
          success: false,
          errorType: "INVALID_FILE",
          message: "Invalid file data"
        });
      }

      const doc = await Document.create({
        filename: file.filename,
        path: file.path,
        fileType: file.mimetype.includes("pdf") ? "pdf" : "image",
        fileSize: file.size,
        uploadedBy: req.user._id
      });

      if (!doc) {
        return res.status(500).json({
          success: false,
          errorType: "DATABASE_ERROR",
          message: "Failed to save document"
        });
      }

      uploadedDocs.push(doc);
    }

    // Log the action
    await createLog(req, "UPLOAD_DOCUMENT", `Uploaded ${req.files.length} file(s): ${uploadedDocs.map(d => d.filename).join(', ')}`);

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${uploadedDocs.length} file(s)`,
      documentsCount: uploadedDocs.length,
      documents: uploadedDocs
    });

  } catch (err) {
    next(err);
  }
};

exports.getDocuments = async (req, res, next) => {
  try {
    const { page = 1, limit = 5, search = "" } = req.query;

    // Input validation
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 5)); // Cap at 100

    // Build search query (case-insensitive regex)
    const query = search 
      ? { filename: { $regex: search, $options: "i" } }
      : {};

    // Fetch documents with pagination
    const docs = await Document.find(query)
      .select('filename fileType fileSize uploadedBy createdAt')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await Document.countDocuments(query);

    if (docs.length === 0 && search) {
      return res.json({
        success: true,
        message: `No documents found matching "${search}"`,
        total: 0,
        page: pageNum,
        limit: limitNum,
        documents: [],
        hasMore: false
      });
    }

    res.status(200).json({
      success: true,
      message: `Retrieved ${docs.length} of ${total} document(s)`,
      total,
      page: pageNum,
      limit: limitNum,
      documents: docs,
      hasMore: (pageNum * limitNum) < total
    });

  } catch (err) {
    next(err);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        errorType: "INVALID_ID",
        message: "Invalid document ID"
      });
    }

    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({ 
        success: false,
        errorType: "NOT_FOUND",
        message: "Document not found" 
      });
    }

    // Delete the document
    await doc.deleteOne();

    // Log the action
    await createLog(req, "DELETE_DOCUMENT", `Deleted document: ${doc.filename}`);

    res.status(200).json({ 
      success: true,
      message: "Document deleted successfully",
      documentId: doc._id
    });

  } catch (err) {
    next(err);
  }
};
