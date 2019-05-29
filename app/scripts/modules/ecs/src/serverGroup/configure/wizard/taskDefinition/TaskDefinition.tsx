import * as React from 'react';
import { module } from 'angular';
import { react2angular } from 'react2angular';
import { IEcsServerGroupCommand } from '../../serverGroupConfiguration.service';
import { ArtifactTypePatterns, IArtifact, IExpectedArtifact, StageArtifactSelector } from '@spinnaker/core';

export interface ITaskDefinitionProps {
  command: IEcsServerGroupCommand;
}

export class TaskDefinition extends React.Component<ITaskDefinitionProps> {
  private excludedArtifactTypePatterns = [
    ArtifactTypePatterns.KUBERNETES,
    ArtifactTypePatterns.DOCKER_IMAGE,
    ArtifactTypePatterns.FRONT50_PIPELINE_TEMPLATE,
  ];

  private onExpectedArtifactSelected = (expectedArtifact: IExpectedArtifact): void => {
    console.log('expected artifact selected');
    const { command } = this.props;
    command.taskDefinitionArtifact.artifactId = expectedArtifact.id;
  };

  private onArtifactChanged = (artifact: IArtifact): void => {
    console.log('artifact changed');
    const { command } = this.props;
    command.taskDefinitionArtifact.artifact = artifact;
  };

  public render(): React.ReactElement<TaskDefinition> {
    const { command } = this.props;
    console.log('REACT command:');
    return (
      <div>
        <p>
          <strong>Stage Artifact Selector</strong>
        </p>
        <StageArtifactSelector
          pipeline={command.viewState.pipeline}
          stage={command.viewState.currentStage}
          expectedArtifactId={command.taskDefinitionArtifact.artifactId}
          artifact={command.taskDefinitionArtifact.artifact}
          onExpectedArtifactSelected={this.onExpectedArtifactSelected}
          onArtifactEdited={this.onArtifactChanged}
          excludedArtifactTypePatterns={this.excludedArtifactTypePatterns}
        />
      </div>
    );
  }
}

export const TASK_DEFINITION_REACT = 'spinnaker.ecs.serverGroup.configure.wizard.taskDefinition.react';
module(TASK_DEFINITION_REACT, []).component('taskDefinitionReact', react2angular(TaskDefinition, ['command']));
