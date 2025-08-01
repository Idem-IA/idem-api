import { Router } from "express";
import {
  getBrandingsByProjectController,
  getBrandingByIdController,
  updateBrandingController,
  deleteBrandingController,
  generateLogoColorsAndTypographyController,
  generateBrandingStreamingController,
} from "../controllers/branding.controller";
import { authenticate } from "../services/auth.service"; // Updated import path
import { checkQuota } from "../middleware/quota.middleware";

export const brandingRoutes = Router();

const resourceName = "brandings";

// All routes are protected and project-specific where applicable

// Generate a new branding for a project
/**
 * @openapi
 * /brandings/generate/{projectId}:
 *   post:
 *     tags:
 *       - Branding
 *     summary: Generate a new branding identity for a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project for which to generate branding.
 *     requestBody:
 *       description: Optional initial data for branding generation.
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Optional initial name for the branding.
 *               description:
 *                 type: string
 *                 description: Optional initial description for the branding.
 *     responses:
 *       '201':
 *         description: Branding identity generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrandIdentityModel'
 *       '400':
 *         description: Bad request.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Project not found.
 *       '500':
 *         description: Internal server error.
 */
brandingRoutes.get(
  `/${resourceName}/generate/:projectId`,
  authenticate,
  checkQuota,
  generateBrandingStreamingController
);

// Generate logo, colors, and typography for a project
/**
 * @openapi
 * /brandings/genColorsAndTypography:
 *   post:
 *     tags:
 *       - Branding
 *     summary: Generate logo, colors, and typography based on project and theme
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: The ID of the project to generate assets for.
 *               themeDescription:
 *                 type: string
 *                 description: A description of the theme or keywords to guide generation.
 *                 nullable: true
 *               brandingId:
 *                  type: string
 *                  description: Optional ID of an existing branding to associate with or update.
 *                  nullable: true
 *     responses:
 *       '200':
 *         description: Logo, colors, and typography generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LogoModel'
 *                 colors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ColorModel'
 *                 typography:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TypographyModel'
 *       '400':
 *         description: Bad request.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Project or Branding not found.
 *       '500':
 *         description: Internal server error.
 */
brandingRoutes.get(
  `/${resourceName}/genColorsAndTypography`,
  authenticate,
  checkQuota,
  generateLogoColorsAndTypographyController
);

// Get all brandings for a specific project
/**
 * @openapi
 * /brandings/getAll/{projectId}:
 *   get:
 *     tags:
 *       - Branding
 *     summary: Retrieve all branding identities for a specific project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project whose brandings are to be retrieved.
 *     responses:
 *       '200':
 *         description: A list of branding identities.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BrandIdentityModel'
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Project not found.
 *       '500':
 *         description: Internal server error.
 */
brandingRoutes.get(
  `/${resourceName}/getAll/:projectId`,
  authenticate,
  getBrandingsByProjectController
);

// Get a specific branding by its ID
/**
 * @openapi
 * /brandings/get/{projectId}:
 *   get:
 *     tags:
 *       - Branding
 *     summary: Retrieve a specific branding identity by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the branding identity to retrieve.
 *     responses:
 *       '200':
 *         description: Details of the branding identity.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrandIdentityModel'
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Branding identity not found.
 *       '500':
 *         description: Internal server error.
 */
brandingRoutes.get(
  `/${resourceName}/get/:projectId`,
  authenticate,
  getBrandingByIdController
);

// Update a specific branding by its ID
/**
 * @openapi
 * /brandings/update/{projectId}:
 *   put:
 *     tags:
 *       - Branding
 *     summary: Update an existing branding identity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the branding identity to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBrandingDto'
 *     responses:
 *       '200':
 *         description: Branding identity updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrandIdentityModel'
 *       '400':
 *         description: Bad request (e.g., validation error).
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Branding identity not found.
 *       '500':
 *         description: Internal server error.
 */
brandingRoutes.put(
  `/${resourceName}/update/:projectId`,
  authenticate,
  updateBrandingController
);

// Delete a specific branding by its ID
/**
 * @openapi
 * /brandings/delete/{projectId}:
 *   delete:
 *     tags:
 *       - Branding
 *     summary: Delete a branding identity by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the branding identity to delete.
 *     responses:
 *       '200':
 *         description: Branding identity deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branding identity deleted successfully.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Branding identity not found.
 *       '500':
 *         description: Internal server error.
 */
brandingRoutes.delete(
  `/${resourceName}/delete/:projectId`,
  authenticate,
  deleteBrandingController
);
