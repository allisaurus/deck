import React from 'react';
import { UISref } from '@uirouter/react';
import { AccountTag, Application, CollapsibleSection } from '@spinnaker/core';

import { IEcsTargetGroup } from '../../domain/IEcsLoadBalancer';

export interface IEcsTargetGroupProps {
  app: Application;
  accountId: string;
  name: string;
  targetGroup: any;
  provider: string;
}

export class EcsTargetGroupDetails extends React.Component<IEcsTargetGroupProps> {
  constructor(props: IEcsTargetGroupProps) {
    super(props);

    const appliction = props.app;

    const tgLB = appliction.loadBalancers.data.find(test => {
      return (
        test.name === props.targetGroup.loadBalancerName &&
        test.region === props.targetGroup.region &&
        test.account === props.accountId
      );
    });

    if (!tgLB) {
      console.log('NO MATCHING LB FOUND'); // eslint-disable-line
    } else {
      console.log(tgLB); // eslint-disable-line
    }
  }

  // fix so not any
  public render(): React.ReactElement<EcsTargetGroupDetails> {
    //console.log('Props for TG details are:'); // eslint-disable-line
    //console.log(this.props); // eslint-disable-line

    const { targetGroup, name, accountId, app } = this.props;

    return (
      <div className="details-panel">
        <div className="header">
          <div className="close-button">
            <UISref to="^">
              <span className="glyphicon glyphicon-remove"></span>
            </UISref>
          </div>
          <div className="header-text horizontal middle">
            <i className="fa fa-crosshairs icon" aria-hidden="true"></i>
            <h3 className="horizontal middle space-between flex-1" select-on-dbl-click>
              {name}
            </h3>
          </div>
        </div>

        <div className="content">
          <CollapsibleSection heading="Target Group Details" defaultExpanded={true}>
            <dl className="dl-horizontal dl-flex">
              <dt>In</dt>
              <dd>
                <AccountTag account={accountId} /* pad="right" */></AccountTag>
                <br />
                {targetGroup.region}
              </dd>
              <dt>VPC</dt>
              <dd>
                {/*  <vpc-tag vpc-id="ctrl.targetGroup.vpcId"></vpc-tag> */}
                {targetGroup.vpcId}
              </dd>
              <dt>Protocol</dt>
              <dd>{targetGroup.protocol}</dd>
              <dt>Port</dt>
              <dd>{targetGroup.port}</dd>
              <dt>Target Type</dt>
              <dd>{targetGroup.type}</dd>
            </dl>
            <dl className="horizontal-when-filters-collapsed">
              <dt>Load Balancer</dt>
              <dd>
                <ul className="collapse-margin-on-filter-collapse">
                  {/* <UISref to="^.loadBalancerDetails" params={{
                    application: app,
                    region: targetGroup.region,
                    accountId: accountId,
                    name: targetGroup.loadBalancerName,
                    vpcId: targetGroup.vpcId,
                    provider: "ecs",
                  }}> */}
                  <a>{targetGroup.loadBalancerName}</a>
                  {/* </UISref> */}
                </ul>
              </dd>
            </dl>
          </CollapsibleSection>
          <CollapsibleSection heading="Status" defaultExpanded={false}></CollapsibleSection>
          <CollapsibleSection heading="Health Checks" defaultExpanded={false}></CollapsibleSection>
          <CollapsibleSection heading="Attributes" defaultExpanded={false}></CollapsibleSection>
        </div>
      </div>
    );
  }
}
