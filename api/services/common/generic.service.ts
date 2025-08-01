import { IRepository } from "../../repository/IRepository";
import { RepositoryFactory } from "../../repository/RepositoryFactory";
import {
  PromptService,
  LLMProvider,
  PromptRequest,
  PromptConfig,
  AIChatMessage,
} from "../prompt.service";
import { ProjectModel } from "../../models/project.model";
import { SectionModel } from "../../models/section.model";
// File operations have been removed - using in-memory context

import logger from "../../config/logger";

// Define interface for prompt step
export interface IPromptStep {
  promptConstant: string;
  stepName: string;
  modelParser?: (content: string) => any;
  // Optional list of specific previous step names this step requires
  // If not provided, all previous steps will be included
  requiresSteps?: string[];
  // Boolean indicating if this step depends on ANY previous steps
  // If false, no previous steps will be included regardless of requiresSteps
  // If true, either all steps or those in requiresSteps will be included
  // If not provided, defaults to true (backward compatibility)
  hasDependencies?: boolean;
}

// Define interface for section result
export interface ISectionResult {
  name: string;
  type: string;
  data: string;
  summary: string;
  parsedData?: any;
}

export class GenericService {
  protected projectRepository: IRepository<ProjectModel>;
  // tempFilePath property removed - using in-memory context instead

  constructor(protected promptService: PromptService) {
    logger.info("GenericService initialized");
    this.projectRepository = RepositoryFactory.getRepository<ProjectModel>();
  }

  /**
   * Fetches a project by ID and user ID
   * @param projectId Project ID
   * @param userId User ID
   * @returns Project model or null if not found
   */
  protected async getProject(
    projectId: string,
    userId: string
  ): Promise<ProjectModel | null> {
    const project = await this.projectRepository.findById(
      projectId,
      `users/${userId}/projects`
    );
    logger.debug(
      `Project data fetched: ${project ? JSON.stringify(project.id) : "null"}`
    );

    if (!project) {
      logger.warn(
        `Project not found with ID: ${projectId} for user: ${userId}`
      );
      return null;
    }

    return project;
  }

  /**
   * Extracts project description from business plan if available
   * @param project Project model
   * @returns Project description or empty string if not found
   */
  protected extractProjectDescription(project: ProjectModel): string {
    let projectDescription = "";

    if (project.analysisResultModel?.businessPlan?.sections) {
      const descriptionSection =
        project.analysisResultModel.businessPlan.sections.find(
          (section) => section.name === "Project Description"
        );

      if (descriptionSection) {
        projectDescription = descriptionSection.data;
        logger.info(
          `Found project description in business plan for projectId: ${project.id}`
        );
      }
    }

    return project.description + "\n\n" + projectDescription;
  }

  /**
   * Runs a single step and appends the result to the temp file
   * @param step Prompt step configuration
   * @param project Project model
   * @param includeProjectInfo Whether to include project details in the prompt
   * @param userId User ID for quota tracking
   * @param promptType Type of prompt for beta restrictions
   * @returns Generated content for the step
   */
  protected async runStepAndAppend(
    step: IPromptStep,
    project: ProjectModel,
    includeProjectInfo: boolean = true,
    messages: AIChatMessage[],
    userId?: string,
    promptType?: string,
    contextFromPreviousSteps: string = "",
    promptConfig: PromptConfig = {
      provider: LLMProvider.GEMINI,
      modelName: "gemini-2.5-flash",
      userId,
      promptType: promptType || step.stepName,
    }
  ): Promise<string> {
    logger.info(
      `Generating section: '${step.stepName}' for projectId: ${project.id}`
    );

    // Construire le prompt avec ou sans contexte des étapes précédentes
    const hasDependencies =
      step.hasDependencies !== undefined ? step.hasDependencies : true;

    let currentStepPrompt: string;

    if (!hasDependencies || !contextFromPreviousSteps) {
      // Prompt sans contexte des étapes précédentes
      currentStepPrompt = `CURRENT TASK: Generate the '${
        step.stepName
      }' section.

${
  includeProjectInfo
    ? `PROJECT DETAILS (from input 'data' object):
${JSON.stringify(
  {
    description: project.description,
    targets: project.targets,
    type: project.type,
    scope: project.scope,
  },
  null,
  2
)}`
    : ""
}

SPECIFIC INSTRUCTIONS FOR '${step.stepName}':
${step.promptConstant}

Please generate *only* the content for the '${step.stepName}' section.`;
    } else {
      // Prompt avec contexte des étapes précédentes intégré directement
      currentStepPrompt = `You are generating content section by section.
Here is the previously generated content for context:

--- PREVIOUS CONTEXT ---
${contextFromPreviousSteps}
--- END PREVIOUS CONTEXT ---

CURRENT TASK: Generate the '${step.stepName}' section.

${
  includeProjectInfo
    ? `PROJECT DETAILS (from input 'data' object):
${JSON.stringify(
  {
    description: project.description,
    targets: project.targets,
    type: project.type,
    scope: project.scope,
  },
  null,
  2
)}`
    : ""
}

SPECIFIC INSTRUCTIONS FOR '${step.stepName}':
${step.promptConstant}

Please generate *only* the content for the '${
        step.stepName
      }' section, building upon the context provided above.`;
    }

    const response = await this.promptService.runPrompt(promptConfig, messages);

    logger.debug(`LLM response for section '${step.stepName}': ${response}`);
    const stepSpecificContent = this.promptService.getCleanAIText(response);
    logger.info(
      `Successfully generated and processed section: '${step.stepName}' for projectId: ${project.id}`
    );

    // In-memory context handling - no file operations needed
    logger.info(
      `Successfully processed section '${step.stepName}' for in-memory context`
    );

    return stepSpecificContent;
  }

  /**
   * Process steps with streaming, calling a callback for each completed step
   * @param steps Array of prompt steps
   * @param project Project model
   * @param stepCallback Callback function called after each step completes
   * @param promptConfig Optional prompt configuration
   * @param promptType Optional prompt type
   * @param userId Optional user ID
   */
  protected async processStepsWithStreaming(
    steps: IPromptStep[],
    project: ProjectModel,
    stepCallback: (result: ISectionResult) => Promise<void>,
    promptConfig?: PromptConfig,
    promptType?: string,
    userId?: string
  ): Promise<void> {
    const completedSteps: { name: string; content: string }[] = [];

    for (const step of steps) {
      // Send a "step_started" event before starting the step
      const stepStartedResult: ISectionResult = {
        name: step.stepName,
        type: "event",
        data: "step_started",
        summary: `Starting ${step.stepName}`,
        parsedData: { status: "started", stepName: step.stepName },
      };
      await stepCallback(stepStartedResult);
      
      const hasDependencies = 
        step.hasDependencies !== undefined ? step.hasDependencies : true;

      // Build context from previous steps if necessary
      let contextFromPreviousSteps = "";

      if (hasDependencies && step.requiresSteps && step.requiresSteps.length > 0) {
        // Filter and concatenate only the specified steps
        const requiredSteps = completedSteps.filter(s => 
          step.requiresSteps!.includes(s.name)
        );

        contextFromPreviousSteps = requiredSteps
          .map(s => `## ${s.name}\n\n${s.content}\n\n---\n`)
          .join("\n");

        logger.info(
          `Built context for step '${step.stepName}' from ${requiredSteps.length} required steps: [${requiredSteps.map(s => s.name).join(", ")}]`
        );
      } else if (hasDependencies && (!step.requiresSteps || step.requiresSteps.length === 0)) {
        // Include all previous steps if hasDependencies=true but requiresSteps not specified
        contextFromPreviousSteps = completedSteps
          .map(s => `## ${s.name}\n\n${s.content}\n\n---\n`)
          .join("\n");

        logger.info(
          `Built context for step '${step.stepName}' from all ${completedSteps.length} previous steps`
        );
      } else {
        logger.info(
          `No context needed for step '${step.stepName}' (no dependencies)`
        );
      }
      
      const messages: AIChatMessage[] = [
        {
          role: "system",
          content: contextFromPreviousSteps,
        },
        {
          role: "user",
          content: step.promptConstant,
        },
      ];
      
      // Execute the current step with the built context
      const content = await this.runStepAndAppend(
        step,
        project,
        true,
        messages,
        userId,
        promptType || step.stepName,
        contextFromPreviousSteps,
        promptConfig
      );

      // Store the content of this step for future steps
      completedSteps.push({
        name: step.stepName,
        content: content,
      });

      let parsedData = null;
      if (step.modelParser) {
        try {
          parsedData = step.modelParser(content);
          logger.info(
            `Successfully parsed ${step.stepName} for projectId: ${project.id}`
          );
        } catch (error) {
          logger.error(
            `Error parsing ${step.stepName} for project ${project.id}:`,
            error
          );
          parsedData = { error: "Parsing error", content };
        }
      }

      const sectionResult: ISectionResult = {
        name: step.stepName,
        type: "text/markdown",
        data: content,
        summary: `${step.stepName} for Project ${project.id}`,
        parsedData: { 
          ...parsedData, 
          status: "completed", 
          stepName: step.stepName 
        },
      };

      // Call the callback with the completed result
      await stepCallback(sectionResult);
    }
  }

  /**
   * Processes multiple steps sequentially
   * @param steps Array of prompt steps
   * @param project Project model
   * @returns Array of section results
   */

  protected async processSteps(
    steps: IPromptStep[],
    project: ProjectModel,
    promptConfig?: PromptConfig,
    promptType?: string,
    userId?: string
  ): Promise<ISectionResult[]> {
    const results: ISectionResult[] = [];
    const completedSteps: { name: string; content: string }[] = [];

    for (const step of steps) {
      const hasDependencies =
        step.hasDependencies !== undefined ? step.hasDependencies : true;

      // Construire le contexte des étapes précédentes si nécessaire
      let contextFromPreviousSteps = "";

      if (
        hasDependencies &&
        step.requiresSteps &&
        step.requiresSteps.length > 0
      ) {
        // Filtrer et concaténer uniquement les étapes spécifiées
        const requiredSteps = completedSteps.filter((s) =>
          step.requiresSteps!.includes(s.name)
        );
        console.log("requiredSteps", requiredSteps);

        contextFromPreviousSteps = requiredSteps
          .map((s) => `## ${s.name}\n\n${s.content}\n\n---\n`)
          .join("\n");

        logger.info(
          `Built context for step '${step.stepName}' from ${
            requiredSteps.length
          } required steps: [${requiredSteps.map((s) => s.name).join(", ")}]`
        );
      } else if (
        hasDependencies &&
        (!step.requiresSteps || step.requiresSteps.length === 0)
      ) {
        // Inclure toutes les étapes précédentes si hasDependencies=true mais requiresSteps non spécifié
        contextFromPreviousSteps = completedSteps
          .map((s) => `## ${s.name}\n\n${s.content}\n\n---\n`)
          .join("\n");

        logger.info(
          `Built context for step '${step.stepName}' from all ${completedSteps.length} previous steps`
        );
      } else {
        // Aucune dépendance
        logger.info(
          `No context needed for step '${step.stepName}' (no dependencies)`
        );
      }
      const messages: AIChatMessage[] = [
        {
          role: "system",
          content: contextFromPreviousSteps,
        },
        {
          role: "user",
          content: step.promptConstant,
        },
      ];
      // Exécuter l'étape actuelle avec le contexte construit
      const content = await this.runStepAndAppend(
        step,
        project,
        true,
        messages,
        userId,
        promptType || step.stepName,
        contextFromPreviousSteps,
        promptConfig
      );

      // Stocker le contenu de cette étape pour les étapes futures
      completedSteps.push({
        name: step.stepName,
        content: content,
      });

      let parsedData = null;
      if (step.modelParser) {
        try {
          parsedData = step.modelParser(content);
          logger.info(
            `Successfully parsed ${step.stepName} for projectId: ${project.id}`
          );
        } catch (error) {
          logger.error(
            `Error parsing ${step.stepName} for project ${project.id}:`,
            error
          );
          parsedData = { error: "Parsing error", content };
        }
      }

      results.push({
        name: step.stepName,
        type: "text/markdown",
        data: content,
        summary: `${step.stepName} for Project ${project.id}`,
        parsedData: parsedData,
      });
    }

    return results;
  }

  /**
   * Parses content to JSON with error handling
   * @param content Content to parse
   * @param sectionName Section name for logging
   * @param projectId Project ID for logging
   * @returns Parsed JSON or fallback object
   */
  protected parseSection(
    content: string,
    sectionName: string,
    projectId: string
  ): any {
    try {
      const parsed = JSON.parse(content);
      logger.info(
        `Successfully parsed ${sectionName} for projectId: ${projectId}`
      );
      return parsed;
    } catch (error) {
      logger.error(
        `Error parsing ${sectionName} for project ${projectId}:`,
        error
      );
      // Return a fallback structure with the raw content
      return {
        content: content,
        summary: `Error parsing ${sectionName}`,
      };
    }
  }

  /**
   * Updates a project with new section results
   * @param projectId Project ID
   * @param userId User ID
   * @param modelProperty Property name in analysisResultModel to update
   * @param sections Array of sections to update
   * @returns Updated project or null
   */
  protected async updateProjectWithSections(
    projectId: string,
    userId: string,
    modelProperty: string,
    sections: SectionModel[]
  ): Promise<ProjectModel | null> {
    try {
      const oldProject = await this.projectRepository.findById(
        projectId,
        `users/${userId}/projects`
      );
      if (!oldProject) {
        logger.warn(
          `Original project not found with ID: ${projectId} for user: ${userId}`
        );
        return null;
      }

      const newProject = {
        ...oldProject,
        analysisResultModel: {
          ...oldProject.analysisResultModel,
          [modelProperty]: {
            sections: sections,
          },
        },
      };

      const updatedProject = await this.projectRepository.update(
        projectId,
        newProject,
        `users/${userId}/projects`
      );
      logger.info(
        `Successfully updated project with ID: ${projectId} with new ${modelProperty} sections`
      );

      return updatedProject;
    } catch (error) {
      logger.error(
        `Error updating project with ${modelProperty} sections:`,
        error
      );
      return null;
    }
  }
}
