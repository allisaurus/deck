import * as React from 'react';
import { module, IPromise } from 'angular';
import { cloneDeep } from 'lodash';
import { react2angular } from 'react2angular';
import {
  IEcsContainerMapping,
  IEcsDockerImage,
  IEcsServerGroupCommand,
  IEcsTaskDefinitionArtifact,
} from '../../serverGroupConfiguration.service';
import {
  ArtifactTypePatterns,
  HelpField,
  IArtifact,
  IExpectedArtifact,
  IPipeline,
  StageArtifactSelectorDelegate,
} from '@spinnaker/core';

export interface ITaskDefinitionProps {
  command: IEcsServerGroupCommand;
  notifyAngular: (key: string, value: any) => void;
  configureCommand: (query: string) => IPromise<void>;
}

interface ITaskDefinitionState {
  taskDefArtifact: IEcsTaskDefinitionArtifact;
  taskDefArtifactAccount: string;
  containerMappings: IEcsContainerMapping[];
  dockerImages: IEcsDockerImage[];
  loadBalancedContainer: string;
}

export class TaskDefinition extends React.Component<ITaskDefinitionProps, ITaskDefinitionState> {
  constructor(props: ITaskDefinitionProps) {
    super(props);
    const cmd = this.props.command;

    this.state = {
      taskDefArtifact: cmd.taskDefinitionArtifact,
      containerMappings: cmd.containerMappings ? cmd.containerMappings : [],
      dockerImages: cmd.backingData && cmd.backingData.filtered ? cmd.backingData.filtered.images : [],
      loadBalancedContainer: cmd.loadBalancedContainer || cmd.containerMappings[0].containerName || '',
      taskDefArtifactAccount: cmd.taskDefinitionArtifactAccount,
    };
  }

  public componentDidMount() {
    this.props.configureCommand('1').then(() => {
      const currentState = cloneDeep(this.state);
      this.setState({
        taskDefArtifact: currentState.taskDefArtifact,
        containerMappings: currentState.containerMappings,
        dockerImages: this.props.command.backingData.filtered.images,
      });
    });
  }

  private getIdToImageMap = (): Map<string, IEcsDockerImage> => {
    const imageIdToDescription = new Map<string, IEcsDockerImage>();
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

  private onExpectedArtifactSelected = (expectedArtifactId: string): void => {
    const selectedArtifact = { artifactId: expectedArtifactId };
    this.props.notifyAngular('taskDefinitionArtifact', selectedArtifact);
    this.setState({ taskDefArtifact: selectedArtifact });
  };

  private onArtifactEdited = (artifact: IArtifact): void => {
    const newArtifact = { artifact: artifact };
    this.props.notifyAngular('taskDefinitionArtifact', newArtifact);
    this.setState({ taskDefArtifact: newArtifact });
  };

  private setArtifactAccount = (accountName: string): void => {
    this.props.notifyAngular('taskDefinitionArtifactAccount', accountName);
    this.setState({ taskDefArtifactAccount: accountName });
  };

  private updatePipeline = (pipeline: IPipeline): void => {
    // TODO: actually update
    console.log(pipeline); // eslint-disable-line
  };

  private pushMapping = () => {
    const taskDefArt = this.state.taskDefArtifact;
    const conMaps = this.state.containerMappings;
    const emptyImage = {
      imageId: '',
      message: '',
      fromTrigger: false,
      fromContext: false,
      stageId: '',
      imageLabelOrSha: '',
      account: '',
      registry: '',
      repository: '',
      tag: '',
    };
    conMaps.push({ containerName: '', imageDescription: emptyImage });
    this.setState({ taskDefArtifact: taskDefArt, containerMappings: conMaps });
  };

  private updateContainerMappingName = (index: number, newName: string) => {
    const currentState = cloneDeep(this.state);
    const currentMapping = currentState.containerMappings[index];
    currentMapping.containerName = newName;

    this.props.notifyAngular('containerMappings', currentState.containerMappings);
    this.setState(currentState);
  };

  private updateContainerMappingImage = (index: number, newImage: string) => {
    const imageMap = this.getIdToImageMap();
    const currentState = cloneDeep(this.state);
    const currentMapping = currentState.containerMappings[index];
    currentMapping.imageDescription = imageMap.get(newImage);

    this.props.notifyAngular('containerMappings', currentState.containerMappings);
    this.setState(currentState);
  };

  private updateLoadBalancedContainer = (containerName: string) => {
    this.props.notifyAngular('loadBalancedContainer', containerName);
    this.setState({ loadBalancedContainer: containerName });
  };

  private removeMapping = (index: number) => {
    const currentState = cloneDeep(this.state);
    currentState.containerMappings.splice(index, 1);

    this.props.notifyAngular('containerMappings', currentState.containerMappings);
    this.setState(currentState);
  };

  public render(): React.ReactElement<TaskDefinition> {
    const { command } = this.props;
    const removeMapping = this.removeMapping;
    const updateContainerMappingName = this.updateContainerMappingName;
    const updateContainerMappingImage = this.updateContainerMappingImage;

    const dockerImages = this.state.dockerImages.map(function(image, index) {
      return (
        <option key={index} value={image.imageId}>
          {image.imageId}
        </option>
      );
    });

    const mappingInputs = this.state.containerMappings.map(function(mapping, index) {
      return (
        <tr key={index}>
          <td>
            <input
              className="form-control input-sm"
              required={true}
              placeholder="enter container name..."
              value={mapping.containerName.toString()}
              onChange={e => updateContainerMappingName(index, e.target.value)}
            />
          </td>
          <td>
            <select
              className="form-control input-sm"
              value={mapping.imageDescription.imageId}
              onChange={e => updateContainerMappingImage(index, e.target.value)}
            >
              {dockerImages}
            </select>
          </td>
          <td>
            <div className="form-control-static">
              <a className="btn-link sm-label" onClick={() => removeMapping(index)}>
                <span className="glyphicon glyphicon-trash" />
                <span className="sr-only">Remove</span>
              </a>
            </div>
          </td>
        </tr>
      );
    });

    const containerOptions = this.state.containerMappings.map(function(mapping, index) {
      return (
        <option key={index} value={mapping.containerName}>
          {mapping.containerName}
        </option>
      );
    });

    return (
      <div className="container-fluid form-horizontal">
        <div className="form-group">
          <div className="col-md-12">
            <StageArtifactSelectorDelegate
              artifact={this.state.taskDefArtifact.artifact}
              excludedArtifactTypePatterns={this.excludedArtifactTypePatterns}
              expectedArtifactId={this.state.taskDefArtifact.artifactId}
              label="Artifact"
              helpKey="ecs.taskDefinition"
              onExpectedArtifactSelected={(artifact: IExpectedArtifact) => this.onExpectedArtifactSelected(artifact.id)}
              onArtifactEdited={this.onArtifactEdited}
              pipeline={command.viewState.pipeline}
              selectedArtifactId={this.state.taskDefArtifact.artifactId}
              selectedArtifactAccount={this.state.taskDefArtifactAccount}
              setArtifactAccount={this.setArtifactAccount}
              setArtifactId={this.onExpectedArtifactSelected}
              stage={command.viewState.currentStage}
              updatePipeline={this.updatePipeline}
            />
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-3 sm-label-right">
            <strong>Load balanced container</strong>
            <HelpField id="ecs.taskDefinition" />
          </div>
          <div className="col-md-9">
            <select
              className="form-control input-sm"
              value={this.state.loadBalancedContainer}
              onChange={e => this.updateLoadBalancedContainer(e.target.value)}
            >
              <option value={''}>{'Select a container for load balancer traffic...'}</option>
              {containerOptions}
            </select>
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
  react2angular(TaskDefinition, ['command', 'notifyAngular', 'configureCommand']),
);
