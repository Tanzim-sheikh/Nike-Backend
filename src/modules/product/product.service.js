import Product from "./product.model.js";

export const addProductService = async (productData) => {
  // Generate slug from name if not provided
  let slug = productData.slug;
  if (!slug && productData.name) {
    slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  // Ensure unique slug
  let uniqueSlug = slug;
  let counter = 1;
  while (await Product.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter++}`;
  }
  productData.slug = uniqueSlug;
  
  const product = new Product(productData);
  await product.save();
  return product;
};


export const getAllProductsService = async (filters = {}) => {
  const query = {};
  if (filters.gender) query.gender = filters.gender;
  if (filters.shoeType) query.shoeType = filters.shoeType;
  if (filters.featured) query.featured = filters.featured === "true";
  if (filters.sale) query.sale = filters.sale === "true";
  if (filters.search) {
  query.$or = [
    { name: { $regex: filters.search, $options: 'i' } },
    { description: { $regex: filters.search, $options: 'i' } }
  ];
}
  
  const products = await Product.find(query).sort({ createdAt: -1 });
  return products;
};

export const getProductByIdService = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }
  return product;
};

export const updateProductService = async (id, updateData) => {
  const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!product) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }
  return product;
};

export const deleteProductService = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }
  return { message: "Product deleted" };
};