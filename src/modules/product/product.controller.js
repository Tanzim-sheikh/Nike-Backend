import {
  addProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService
} from "./product.service.js";
import { success, created, error } from "../../common/response.js";
import { uploadMultiple, uploadToCloudinary } from "../../middleware/upload.js";


export const addProduct = async (req, res, next) => {
  try {
    // Multer files are in req.files
    if (!req.files || req.files.length === 0) {
      return error(res, "At least one product image is required", 400);
    }
    if (req.files.length > 5) {
      return error(res, "Maximum 5 images allowed", 400);
    }

    // Upload images to cloudinary
    const imageUrls = [];
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.buffer);
      imageUrls.push(url);
    }

    const { name, description, gender, shoeType, price, sale, salePrice, sizes, items_left, featured } = req.body;
    const productData = {
      name,
      description: description || "",
      gender,
      shoeType,
      price: Number(price),
      sale: sale === "true" || sale === true,
      salePrice: salePrice ? Number(salePrice) : null,
      sizes: typeof sizes === "string" ? JSON.parse(sizes) : sizes,
      items_left: Number(items_left) || 0,
      featured: featured === "true" || featured === true,
      images: imageUrls
    };

    const product = await addProductService(productData);
    return created(res, product, "Product added");
  } catch (err) {
    next(err);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await getAllProductsService(req.query);
    return success(res, products, "Products fetched");
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await getProductByIdService(req.params.id);
    return success(res, product, "Product found");
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  uploadMultiple(req, res, async (err) => {
    if (err) return error(res, err.message, 400);
    try {
      const { id } = req.params;
      const { name, description, gender, shoeType, price, sale, salePrice, sizes, items_left, featured, existingImages, removedImages } = req.body;
      
      let finalImages = existingImages ? JSON.parse(existingImages) : [];
      if (removedImages) {
        const toRemove = JSON.parse(removedImages);
        // Optionally delete from cloudinary here
        finalImages = finalImages.filter(img => !toRemove.includes(img));
      }
      // Upload new images
      if (req.files && req.files.length) {
        for (const file of req.files) {
          const url = await uploadToCloudinary(file.buffer);
          finalImages.push(url);
        }
      }
      const updateData = {
        name, description, gender, shoeType, price, sale, salePrice, sizes: JSON.parse(sizes),
        items_left, featured, images: finalImages
      };
      const product = await updateProductService(id, updateData);
      return success(res, product, "Product updated");
    } catch (err) {
      next(err);
    }
  });
};

export const deleteProduct = async (req, res, next) => {
  try {
    const result = await deleteProductService(req.params.id);
    return success(res, result, "Product deleted");
  } catch (err) {
    next(err);
  }
};