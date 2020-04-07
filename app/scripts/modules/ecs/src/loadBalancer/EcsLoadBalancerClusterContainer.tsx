import React from 'react';
import { isEqual } from 'lodash';

import { ILoadBalancerClusterContainerProps } from '@spinnaker/core';

import { IEcsLoadBalancer } from '../domain/IEcsLoadBalancer';
import { EcsTargetGroup } from './TargetGroup';

export class EcsLoadBalancerClusterContainer extends React.Component<ILoadBalancerClusterContainerProps> {
  public shouldComponentUpdate(nextProps: ILoadBalancerClusterContainerProps) {
    const serverGroupsDiffer = () =>
      !isEqual(
        (nextProps.serverGroups || []).map(g => g.name),
        (this.props.serverGroups || []).map(g => g.name),
      );
    const targetGroupsDiffer = () =>
      !isEqual(
        ((nextProps.loadBalancer as IEcsLoadBalancer).targetGroups || []).map(t => t.targetGroupName),
        ((this.props.loadBalancer as IEcsLoadBalancer).targetGroups || []).map(t => t.targetGroupName),
      );
    return (
      nextProps.showInstances !== this.props.showInstances ||
      nextProps.showServerGroups !== this.props.showServerGroups ||
      nextProps.loadBalancer !== this.props.loadBalancer ||
      serverGroupsDiffer() ||
      targetGroupsDiffer()
    );
  }

  public render(): React.ReactElement<EcsLoadBalancerClusterContainer> {
    //console.log('Cluster container:'); // eslint-disable-line
    //console.log(this.props); // eslint-disable-line

    const { loadBalancer, showInstances, showServerGroups } = this.props;

    const alb = loadBalancer as IEcsLoadBalancer;
    const TargetGroups = alb.targetGroups.map(targetGroup => {
      return (
        <EcsTargetGroup
          key={targetGroup.targetGroupName}
          loadBalancer={loadBalancer as IEcsLoadBalancer}
          targetGroup={targetGroup}
          showInstances={showInstances}
          showServerGroups={showServerGroups}
        />
      );
    });

    /* if (loadBalancer) {
      return <div className="cluster-container">{TargetGroups}</div>;
    } else {
      return <div className="cluster-container">Nothing to show.</div>;
    } */

    return <div className="cluster-container">{TargetGroups}</div>;
  }
}
