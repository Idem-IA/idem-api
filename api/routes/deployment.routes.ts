import { Router } from "express";
import { authenticate } from "../services/auth.service";
import {
  CreateDeploymentController,
  GetDeploymentsByProjectController,
  GetDeploymentByIdController,
  UpdateDeploymentController,
  DeleteDeploymentController,
  UpdateGitConfigController,
  UpdateEnvironmentVariablesController,
  UpdateArchitectureComponentsController,
  AddChatMessageController,
  StartPipelineController,
  GetPipelineStatusController,
  EstimateCostController,
  generateDeploymentController,
} from "../controllers/deployment.controller";

export const deploymentRoutes = Router();
const resourceName = "/deployments";

// Core CRUD Routes
/**
 * @openapi
 * /deployments/generate:
 *   post:
 *     tags:
 *       - Deployments
 *     summary: Generate a new deployment configuration
 *     description: Creates a new deployment with optional initial configuration
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Optional initial data for the deployment
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: ID of the project this deployment belongs to
 *                 example: "project_123456789"
 *               name:
 *                 type: string
 *                 description: Optional initial name for the deployment
 *                 example: "My Production Deployment"
 *               environment:
 *                 type: string
 *                 enum: [development, staging, production]
 *                 description: Environment type for the deployment
 *                 example: "production"
 *     responses:
 *       201:
 *         description: Deployment configuration generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
deploymentRoutes.post(
  `${resourceName}/generate`,
  generateDeploymentController
);

/**
 * @openapi
 * /deployments/getByProject/{projectId}:
 *   get:
 *     tags:
 *       - Deployments
 *     summary: Retrieve all deployments for a specific project
 *     description: Returns a list of all deployments associated with the specified project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project whose deployments are to be retrieved
 *         example: "project_123456789"
 *     responses:
 *       200:
 *         description: A list of deployments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
deploymentRoutes.get(
  `${resourceName}/:projectId`,
  authenticate,
  GetDeploymentsByProjectController
);

/**
 * @openapi
 * /deployments/get/{deploymentId}:
 *   get:
 *     tags:
 *       - Deployments
 *     summary: Retrieve a specific deployment by its ID
 *     description: Returns detailed information about a specific deployment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to retrieve
 *         example: "deployment_123456789"
 *     responses:
 *       200:
 *         description: Deployment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Deployment not found
 *       500:
 *         description: Internal server error
 */
deploymentRoutes.get(
  `${resourceName}/:projectId/:deploymentId`,
  authenticate,
  GetDeploymentByIdController
);

/**
 * @openapi
 * /deployments/update/{deploymentId}:
 *   put:
 *     tags:
 *       - Deployments
 *     summary: Update an existing deployment
 *     description: Updates the configuration and settings of an existing deployment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to update
 *         example: "deployment_123456789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDeploymentDto'
 *     responses:
 *       200:
 *         description: Deployment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Deployment not found
 *       500:
 *         description: Internal server error
 */
deploymentRoutes.put(
  `${resourceName}/update/:deploymentId`,
  authenticate,
  UpdateDeploymentController
);

/**
 * @openapi
 * /deployments/delete/{deploymentId}:
 *   delete:
 *     tags:
 *       - Deployments
 *     summary: Delete a deployment by its ID
 *     description: Permanently removes a deployment and all associated resources
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to delete
 *         example: "deployment_123456789"
 *     responses:
 *       200:
 *         description: Deployment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Deployment not found
 *       500:
 *         description: Internal server error
 */
deploymentRoutes.delete(
  `${resourceName}/delete/:deploymentId`,
  authenticate,
  DeleteDeploymentController
);

// Configuration Update Routes
/**
 * @openapi
 * /deployments/updateGitConfig/{deploymentId}:
 *   put:
 *     tags:
 *       - Deployments Configuration
 *     summary: Update Git repository configuration
 *     description: Updates the Git repository settings for a specific deployment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to update
 *         example: "deployment_123456789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGitRepositoryDto'
 *     responses:
 *       200:
 *         description: Git repository configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Deployment not found
 *       500:
 *         description: Internal server error
 */
deploymentRoutes.put(
  `${resourceName}/updateGitConfig/:deploymentId`,
  authenticate,
  UpdateGitConfigController
);

/**
 * @openapi
 * /deployments/updateEnvVars/{deploymentId}:
 *   put:
 *     tags:
 *       - Deployments Configuration
 *     summary: Update environment variables
 *     description: Updates the environment variables for a specific deployment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to update
 *         example: "deployment_123456789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEnvironmentVariablesDto'
 *     responses:
 *       200:
 *         description: Environment variables updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Deployment not found
 *       500:
 *         description: Internal server error
 */
deploymentRoutes.put(
  `${resourceName}/updateEnvVars/:deploymentId`,
  authenticate,
  UpdateEnvironmentVariablesController
);

/**
 * @openapi
 * /deployments/{deploymentId}/chat:
 *   post:
 *     tags:
 *       - Deployments AI Assistant
 *     summary: Send a message to the AI assistant
 *     description: Adds a user message to the deployment's chat history and generates an AI response
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to interact with
 *         example: "deployment_123456789"
 *     requestBody:
 *       description: User message to send to the AI assistant
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The user's message text
 *                 example: "How do I deploy this application?"
 *     responses:
 *       200:
 *         description: Message processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Chat message processed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deployment:
 *                       $ref: '#/components/schemas/DeploymentDto'
 *                     aiResponse:
 *                       type: string
 *                       description: The AI assistant's response
 *                       example: "To deploy your application, you'll need to configure your Git repository and environment variables first. Would you like me to guide you through the process?"
 *       400:
 *         description: Bad request - invalid message format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Deployment not found or not in AI assistant mode
 *       500:
 *         description: Internal server error
 */
deploymentRoutes.post(
  `${resourceName}/chat`,
  authenticate,
  AddChatMessageController
);

/**
 * @openapi
 * /deployments/updateArchitectureTemplates/{deploymentId}:
 *   put:
 *     tags:
 *       - Deployments Configuration
 *     summary: Update architecture components
 *     description: Updates the architecture components for a specific deployment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to update
 *         example: "deployment_123456789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateArchitectureComponentsDto'
 *     responses:
 *       200:
 *         description: Architecture components updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Deployment not found
 *       500:
 *         description: Internal server error
 */
deploymentRoutes.put(
  `${resourceName}/updateArchitectureTemplates/:deploymentId`,
  authenticate,
  UpdateArchitectureComponentsController
);

// Pipeline Management
/**
 * @openapi
 * /deployments/startPipeline/{deploymentId}:
 *   post:
 *     tags:
 *       - Deployments Pipeline
 *     summary: Start deployment pipeline
 *     description: Initiates the deployment pipeline for a configured deployment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to start
 *         example: "deployment_123456789"
 *     responses:
 *       200:
 *         description: Deployment pipeline started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       400:
 *         description: Bad request - deployment not configured or already running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Deployment not found
 *       500:
 *         description: Internal server error
 */
deploymentRoutes.post(
  `${resourceName}/startPipeline/:deploymentId`,
  authenticate,
  StartPipelineController
);

/**
 * @openapi
 * /deployments/getPipelineStatus/{deploymentId}:
 *   get:
 *     tags:
 *       - Deployments Pipeline
 *     summary: Get deployment pipeline status
 *     description: Retrieves the current status of the deployment pipeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to get the pipeline status for
 *         example: "deployment_123456789"
 *     responses:
 *       200:
 *         description: Deployment pipeline status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Deployment not found
 *       500:
 *         description: Internal server error
 */
deploymentRoutes.get(
  `${resourceName}/getPipelineStatus/:deploymentId`,
  authenticate,
  GetPipelineStatusController
);

/**
 * @openapi
 * /deployments/estimateCost/{deploymentId}:
 *   get:
 *     tags:
 *       - Deployments Pipeline
 *     summary: Estimate deployment cost
 *     description: Calculates and returns cost estimation for the deployment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to estimate the cost for
 *         example: "deployment_123456789"
 *     responses:
 *       200:
 *         description: Deployment cost estimation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Deployment not found
 *       500:
 *         description: Internal server error
 */
deploymentRoutes.get(
  `${resourceName}/estimateCost/:deploymentId`,
  authenticate,
  EstimateCostController
);

/**
 * @openapi
 * /deployments/create:
 *   post:
 *     tags:
 *       - Deployments
 *     summary: Create deployment
 *     description: Creates a new deployment with full configuration
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeploymentDto'
 *     responses:
 *       201:
 *         description: Deployment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
deploymentRoutes.post(
  `${resourceName}/create`,
  authenticate,
  CreateDeploymentController
);

/**
 * @openapi
 * components:
 *   schemas:
 *     BaseResponseDto:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *           example: true
 *         message:
 *           type: string
 *           description: Response message
 *           example: "Operation completed successfully"
 *         data:
 *           description: Response data (varies by endpoint)
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of error messages
 *           example: ["Validation failed", "Required field missing"]
 *     
 *     CreateDeploymentDto:
 *       type: object
 *       required:
 *         - name
 *         - projectId
 *         - environment
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the deployment
 *           example: "Production API"
 *         projectId:
 *           type: string
 *           description: ID of the project this deployment belongs to
 *           example: "project_123456789"
 *         environment:
 *           type: string
 *           enum: [development, staging, production]
 *           description: Environment type for the deployment
 *           example: "production"
 *         description:
 *           type: string
 *           description: Optional description of the deployment
 *           example: "Production deployment for the main API"
 *         gitRepository:
 *           $ref: '#/components/schemas/GitRepositoryDto'
 *         environmentVariables:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EnvironmentVariableDto'
 *           description: Environment variables for the deployment
 *         architectureComponents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ArchitectureComponentDto'
 *           description: Architecture components for the deployment
 *         mode:
 *           type: string
 *           enum: [beginner, assistant, template, expert]
 *           description: Deployment mode
 *           example: "expert"
 *         architectureTemplate:
 *           type: string
 *           description: ID of the architecture template to use
 *           example: "template_web_app"
 *     
 *     UpdateDeploymentDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the deployment
 *           example: "Updated Production API"
 *         description:
 *           type: string
 *           description: Description of the deployment
 *           example: "Updated production deployment"
 *         environment:
 *           type: string
 *           enum: [development, staging, production]
 *           description: Environment type for the deployment
 *           example: "production"
 *         gitRepository:
 *           $ref: '#/components/schemas/GitRepositoryDto'
 *         environmentVariables:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EnvironmentVariableDto'
 *           description: Environment variables for the deployment
 *         architectureComponents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ArchitectureComponentDto'
 *           description: Architecture components for the deployment
 *         chatMessages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChatMessageDto'
 *           description: Chat messages for the deployment
 *     
 *     GitRepositoryDto:
 *       type: object
 *       required:
 *         - provider
 *         - url
 *         - branch
 *       properties:
 *         provider:
 *           type: string
 *           enum: [github, gitlab, bitbucket, azure-repos]
 *           description: Git provider
 *           example: "github"
 *         url:
 *           type: string
 *           description: Repository URL
 *           example: "https://github.com/user/repo.git"
 *         branch:
 *           type: string
 *           description: Branch name
 *           example: "main"
 *         accessToken:
 *           type: string
 *           description: Access token for repository access
 *           example: "ghp_xxxxxxxxxxxxxxxx"
 *         webhookId:
 *           type: string
 *           description: Webhook ID for repository integration
 *           example: "webhook_123456789"
 *     
 *     UpdateGitRepositoryDto:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           description: Repository URL
 *           example: "https://github.com/user/repo.git"
 *         branch:
 *           type: string
 *           description: Branch name
 *           example: "main"
 *         accessToken:
 *           type: string
 *           description: Access token for repository access
 *           example: "ghp_xxxxxxxxxxxxxxxx"
 *     
 *     EnvironmentVariableDto:
 *       type: object
 *       required:
 *         - key
 *         - value
 *         - isSecret
 *       properties:
 *         key:
 *           type: string
 *           description: Environment variable key
 *           example: "DATABASE_URL"
 *         value:
 *           type: string
 *           description: Environment variable value
 *           example: "postgresql://user:pass@localhost:5432/db"
 *         isSecret:
 *           type: boolean
 *           description: Whether this is a secret variable
 *           example: true
 *     
 *     UpdateEnvironmentVariablesDto:
 *       type: object
 *       required:
 *         - variables
 *       properties:
 *         variables:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EnvironmentVariableDto'
 *           description: Array of environment variables
 *     
 *     ArchitectureComponentDto:
 *       type: object
 *       required:
 *         - instanceId
 *         - type
 *       properties:
 *         instanceId:
 *           type: string
 *           description: Unique instance ID for the component
 *           example: "comp_123456789"
 *         type:
 *           type: string
 *           description: Type of architecture component
 *           example: "lambda"
 *         configuration:
 *           type: object
 *           additionalProperties: true
 *           description: Component-specific configuration
 *           example: {"memory": "512MB", "timeout": 30}
 *         dependencies:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of component dependencies
 *           example: ["comp_987654321"]
 *     
 *     UpdateArchitectureComponentsDto:
 *       type: object
 *       required:
 *         - components
 *       properties:
 *         components:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ArchitectureComponentDto'
 *           description: Array of architecture components
 *     
 *     ChatMessageDto:
 *       type: object
 *       required:
 *         - sender
 *         - text
 *       properties:
 *         sender:
 *           type: string
 *           enum: [user, ai]
 *           description: Message sender
 *           example: "user"
 *         text:
 *           type: string
 *           description: Message content
 *           example: "How do I configure the database?"
 *     
 *     UpdateChatMessagesDto:
 *       type: object
 *       required:
 *         - messages
 *       properties:
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChatMessageDto'
 *           description: Array of chat messages
 *     
 *     PipelineStepDto:
 *       type: object
 *       required:
 *         - name
 *         - status
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the pipeline step
 *           example: "Code Analysis"
 *         status:
 *           type: string
 *           enum: [pending, in-progress, succeeded, failed, skipped]
 *           description: Current status of the step
 *           example: "succeeded"
 *         startedAt:
 *           type: string
 *           format: date-time
 *           description: When the step started
 *           example: "2024-01-15T10:30:00Z"
 *         finishedAt:
 *           type: string
 *           format: date-time
 *           description: When the step finished
 *           example: "2024-01-15T10:35:00Z"
 *         logs:
 *           type: string
 *           description: Step execution logs
 *           example: "Step completed successfully"
 *         errorMessage:
 *           type: string
 *           description: Error message if step failed
 *           example: "Build failed due to compilation errors"
 *         aiRecommendation:
 *           type: string
 *           description: AI recommendation for the step
 *           example: "Consider optimizing the build process"
 *     
 *     PipelineStatusDto:
 *       type: object
 *       required:
 *         - currentStage
 *         - steps
 *       properties:
 *         currentStage:
 *           type: string
 *           description: Current stage of the pipeline
 *           example: "Building"
 *         steps:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PipelineStepDto'
 *           description: Array of pipeline steps
 *         startedAt:
 *           type: string
 *           format: date-time
 *           description: When the pipeline started
 *           example: "2024-01-15T10:00:00Z"
 *         estimatedCompletionTime:
 *           type: string
 *           format: date-time
 *           description: Estimated completion time
 *           example: "2024-01-15T10:30:00Z"
 *     
 *     CostEstimationDto:
 *       type: object
 *       required:
 *         - monthlyCost
 *         - hourlyCost
 *         - oneTimeCost
 *         - currency
 *         - estimatedAt
 *         - breakdown
 *       properties:
 *         monthlyCost:
 *           type: number
 *           description: Estimated monthly cost in the specified currency
 *           example: 150.50
 *         hourlyCost:
 *           type: number
 *           description: Estimated hourly cost in the specified currency
 *           example: 0.21
 *         oneTimeCost:
 *           type: number
 *           description: One-time setup cost in the specified currency
 *           example: 25.00
 *         currency:
 *           type: string
 *           description: Currency for cost estimates
 *           example: "USD"
 *         estimatedAt:
 *           type: string
 *           format: date-time
 *           description: When the cost estimation was calculated
 *           example: "2024-01-15T10:00:00Z"
 *         breakdown:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - componentId
 *               - componentName
 *               - cost
 *               - description
 *             properties:
 *               componentId:
 *                 type: string
 *                 description: ID of the component
 *                 example: "comp_123456789"
 *               componentName:
 *                 type: string
 *                 description: Name of the component
 *                 example: "Lambda Function"
 *               cost:
 *                 type: number
 *                 description: Cost for this component
 *                 example: 25.00
 *               description:
 *                 type: string
 *                 description: Description of the cost
 *                 example: "Monthly cost for Lambda function"
 */

