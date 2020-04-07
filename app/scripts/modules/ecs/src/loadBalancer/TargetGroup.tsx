import React from 'react';
import { UISref, UISrefActive } from '@uirouter/react';

import { IEcsLoadBalancer, IEcsTargetGroup } from '../domain/IEcsLoadBalancer';

export interface IEcsTargetGroupProps {
  loadBalancer: IEcsLoadBalancer;
  targetGroup: IEcsTargetGroup;
  showServerGroups: boolean;
  showInstances: boolean;
}

export class EcsTargetGroup extends React.Component<IEcsTargetGroupProps> {
  public render(): React.ReactElement<EcsTargetGroup> {
    const { targetGroup, loadBalancer } = this.props;

    //console.log('TargetGroup container:'); // eslint-disable-line
    //console.log(this.props); // eslint-disable-line

    // TODO retreive values from details pane directly, vs. passing through state
    const params = {
      loadBalancerName: loadBalancer.name,
      region: loadBalancer.region,
      accountId: loadBalancer.account,
      name: targetGroup.targetGroupName,
      //targetGroup: targetGroup,
      //port: targetGroup.port,
      protocol: targetGroup.protocol,
      vpcId: targetGroup.vpcId,
      provider: loadBalancer.cloudProvider, //targetGroup.cloudProvider,
    };

    return (
      <div className="target-group-container container-fluid no-padding">
        <UISrefActive class="active">
          <UISref to=".ecsTargetGroupDetails" params={params}>
            <div className={`clickable clickable-row row no-margin-y target-group-header`}>
              <div className="col-md-8 target-group-title">{targetGroup.targetGroupName}</div>
            </div>
          </UISref>
        </UISrefActive>
      </div>
    );
  }
}
