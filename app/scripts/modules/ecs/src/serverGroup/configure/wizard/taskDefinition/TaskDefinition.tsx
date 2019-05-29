import * as React from 'react';
import { module } from 'angular';
import { react2angular } from 'react2angular';
import { IEcsServerGroupCommand, IEcsTaskDefinitionArtifact } from '../../serverGroupConfiguration.service';
import { ArtifactTypePatterns, HelpField, IArtifact, IExpectedArtifact, StageArtifactSelector } from '@spinnaker/core';

export interface ITaskDefinitionProps {
  command: IEcsServerGroupCommand;
  notifyAngular: (key: string, value: IEcsTaskDefinitionArtifact) => void;
}

interface ITaskDefinitionState {
  taskDefArtifact: IEcsTaskDefinitionArtifact;
}

export class TaskDefinition extends React.Component<ITaskDefinitionProps, ITaskDefinitionState> {
  constructor(props: ITaskDefinitionProps) {
    super(props);
    this.state = { taskDefArtifact: this.props.command.taskDefinitionArtifact };
  }

  private excludedArtifactTypePatterns = [
    ArtifactTypePatterns.KUBERNETES,
    ArtifactTypePatterns.DOCKER_IMAGE,
    ArtifactTypePatterns.FRONT50_PIPELINE_TEMPLATE,
    ArtifactTypePatterns.EMBEDDED_BASE64,
  ];

  private onExpectedArtifactSelected = (expectedArtifact: IExpectedArtifact): void => {
    const selectedArtifact = { artifactId: expectedArtifact.id };
    this.props.notifyAngular('expectedArtifact', selectedArtifact);
    this.setState({ taskDefArtifact: selectedArtifact });
  };

  private onArtifactEdited = (artifact: IArtifact): void => {
    const newArtifact = { artifact: artifact };
    this.props.notifyAngular('artifact', newArtifact);
    this.setState({ taskDefArtifact: newArtifact });
  };

  public render(): React.ReactElement<TaskDefinition> {
    const { command } = this.props;
    return (
      <div className="container-fluid form-horizontal">
        <div className="form-group">
          <div className="col-md-3 sm-label-right">
            <strong>Task Definition source</strong>
            <HelpField id="ecs.taskDefinition" />
          </div>
          <div className="col-md-2 radio">
            <label>
              <input
                type="radio"
                ng-model="$ctrl.command.useTaskDefinitionArtifact"
                ng-value="false"
                id="taskDefinitionInputs"
              />
              Inputs
            </label>
          </div>
          <div className="col-md-1 radio">
            <label>
              <input
                type="radio"
                ng-model="$ctrl.command.useTaskDefinitionArtifact"
                ng-value="true"
                id="taskDefinitionArtifact"
              />
              Artifact
            </label>
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-3 sm-label-right">
            <strong>Task Definition Artifact</strong>
            <HelpField id="ecs.taskDefinition" />
          </div>
          <div className="col-md-9">
            <StageArtifactSelector
              pipeline={command.viewState.pipeline}
              stage={command.viewState.currentStage}
              expectedArtifactId={this.state.taskDefArtifact.artifactId}
              artifact={this.state.taskDefArtifact.artifact}
              onExpectedArtifactSelected={this.onExpectedArtifactSelected}
              onArtifactEdited={this.onArtifactEdited}
              excludedArtifactTypePatterns={this.excludedArtifactTypePatterns}
            />
          </div>
        </div>
      </div>
    );
  }
}

export const TASK_DEFINITION_REACT = 'spinnaker.ecs.serverGroup.configure.wizard.taskDefinition.react';
module(TASK_DEFINITION_REACT, []).component(
  'taskDefinitionReact',
  react2angular(TaskDefinition, ['command', 'notifyAngular']),
);
