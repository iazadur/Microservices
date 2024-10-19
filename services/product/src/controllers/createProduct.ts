import prisma from "@/prisma";
import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { ProductCreateDTOSchema } from "@/schema";
import { INVENTORY_URL } from "@/config";

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Validate request body
    const productData = ProductCreateDTOSchema.safeParse(req.body);
    if (!productData.success) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: productData.error.errors,
      });
    }

    // check if sku already exists
    const existingProduct = await prisma.product.findFirst({
      where: { sku: productData.data.sku },
    });

    if (existingProduct) {
      return res.status(400).json({
        message: "Product with this sku already exists",
      });
    }

    // Create product
    const product = await prisma.product.create({
      data: productData.data,
    });

    console.log("Product created successfully", product.id);

    // Create inventory
    const { data: inventory } = await axios.post(
      `${INVENTORY_URL}/inventories`,
      {
        productId: product.id,
        sku: product.sku,
        quantity: 0,
      }
    );

    console.log("Inventory created successfully", inventory?.data?.id);

    // Update product with inventoryId
    await prisma.product.update({
      where: { id: product.id },
      data: {
        inventoryId: inventory?.data?.id,
      },
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: {
        ...product,
        inventoryId: inventory?.data?.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default createProduct;
