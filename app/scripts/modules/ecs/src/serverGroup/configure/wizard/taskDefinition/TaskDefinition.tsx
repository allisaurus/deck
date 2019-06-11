import * as React from 'react';
import { module } from 'angular';
import { cloneDeep } from 'lodash';
import { react2angular } from 'react2angular';
import {
  IEcsContainerMapping,
  IEcsDockerImage,
  IEcsServerGroupCommand,
  IEcsTaskDefinitionArtifact,
} from '../../serverGroupConfiguration.service';
import { ArtifactTypePatterns, HelpField, IArtifact, IExpectedArtifact, StageArtifactSelector } from '@spinnaker/core';

export interface ITaskDefinitionProps {
  command: IEcsServerGroupCommand;
  notifyAngular: (key: string, value: IEcsTaskDefinitionArtifact) => void;
}

interface ITaskDefinitionState {
  taskDefArtifact: IEcsTaskDefinitionArtifact;
  containerMappings: IEcsContainerMapping[];
}

export class TaskDefinition extends React.Component<ITaskDefinitionProps, ITaskDefinitionState> {
  constructor(props: ITaskDefinitionProps) {
    super(props);
    let mappings = this.props.command.containerMappings;

    if (!mappings) {
      mappings = [];
    }

    this.state = {
      taskDefArtifact: this.props.command.taskDefinitionArtifact,
      containerMappings: mappings,
    };
  }

  private getIdToImageMap = (): Map<string, IEcsDockerImage> => {
    let imageIdToDescription = new Map<string, IEcsDockerImage>();
    this.props.command.backingData.filtered.images.forEach(e => {
      imageIdToDescription.set(e.imageId, e);
    });

    return imageIdToDescription;
  };

  private excludedArtifactTypePatterns = [
    ArtifactTypePatterns.KUBERNETES,
    ArtifactTypePatterns.DOCKER_IMAGE,
    ArtifactTypePatterns.FRONT50_PIPELINE_TEMPLATE,
    ArtifactTypePatterns.EMBEDDED_BASE64,
  ];

  private onExpectedArtifactSelected = (expectedArtifact: IExpectedArtifact): void => {
    const selectedArtifact = { artifactId: expectedArtifact.id };
    this.props.notifyAngular('taskDefinitionArtifact', selectedArtifact);
    this.setState({ taskDefArtifact: selectedArtifact });
  };

  private onArtifactEdited = (artifact: IArtifact): void => {
    const newArtifact = { artifact: artifact };
    this.props.notifyAngular('taskDefinitionArtifact', newArtifact);
    this.setState({ taskDefArtifact: newArtifact });
  };

  private pushMapping = () => {
    let taskDefArt = this.state.taskDefArtifact;
    let conMaps = this.state.containerMappings;
    conMaps.push({ containerName: '', imageDescription: undefined });
    this.setState({ taskDefArtifact: taskDefArt, containerMappings: conMaps });
  };

  private updateContainerMappingName = (index: number, newName: string) => {
    console.log('changed name: ' + newName + ' for ' + index.toString()); // eslint-disable-line
    let currentState = cloneDeep(this.state);
    let currentMapping = currentState.containerMappings[index];
    currentMapping.containerName = newName;
    this.setState(currentState);
    console.log(currentMapping); // eslint-disable-line
  };

  private updateContainerMappingImage = (index: number, newImage: string) => {
    console.log('changed image: ' + newImage + ' for ' + index.toString()); // eslint-disable-line
    const imageMap = this.getIdToImageMap();

    let currentState = cloneDeep(this.state);
    let currentMapping = currentState.containerMappings[index];
    currentMapping.imageDescription = imageMap.get(newImage);
    this.setState(currentState);
    console.log(currentState); // eslint-disable-line
  };

  private removeMapping = () => {
    console.log('REMOVE clicked.'); // eslint-disable-line
  };

  public render(): React.ReactElement<TaskDefinition> {
    const { command } = this.props;
    const removeMapping = this.removeMapping;
    const updateContainerMappingName = this.updateContainerMappingName;
    const updateContainerMappingImage = this.updateContainerMappingImage;

    let dockerImages;
    if (command.backingData && command.backingData.filtered && command.backingData.filtered.images) {
      dockerImages = command.backingData.filtered.images.map(function(image) {
        return <option value={image.imageId}>{image.imageId}</option>;
      });
    }

    const mappingInputs = this.state.containerMappings.map(function(mapping, index) {
      return (
        <tr key={index}>
          <td>
            <input
              className="form-control input-sm"
              required={true}
              placeholder="enter container name..."
              defaultValue={mapping.containerName.toString()}
              onChange={e => updateContainerMappingName(index, e.target.value)}
            />
          </td>
          <td>
            <select
              className="form-control input-sm"
              defaultValue={''}
              onChange={e => updateContainerMappingImage(index, e.target.value)}
            >
              {dockerImages}
            </select>
          </td>
          <td>
            <div className="form-control-static">
              <a className="btn-link sm-label" onClick={removeMapping}>
                <span className="glyphicon glyphicon-trash" />
                <span className="sr-only">Remove</span>
              </a>
            </div>
          </td>
        </tr>
      );
    });

    return (
      <div className="container-fluid form-horizontal">
        <div className="form-group">
          <div className="col-md-3 sm-label-right">
            <strong>Artifact</strong>
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
        <div className="form-group">
          <div className="sm-label-left">
            <b>Container Mappings</b>
            <HelpField id="ecs.taskDefinition" />
          </div>
          <form name="ecsTaskDefinitionContainerMappings">
            <table className="table table-condensed packed tags">
              <thead>
                <tr key="header">
                  <th style={{ width: '30%' }}>
                    Container name
                    <HelpField id="ecs.serviceDiscoveryRegistry" />
                  </th>
                  <th style={{ width: '70%' }}>
                    Container image
                    <HelpField id="ecs.serviceDiscoveryContainerPort" />
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody>{mappingInputs}</tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>
                    <button className="btn btn-block btn-sm add-new" onClick={this.pushMapping}>
                      <span className="glyphicon glyphicon-plus-sign" />
                      Add New Container Mapping
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </form>
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
