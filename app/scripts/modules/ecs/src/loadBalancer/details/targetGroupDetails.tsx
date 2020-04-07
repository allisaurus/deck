import React from 'react';
import { UISref } from '@uirouter/react';
import { AccountTag, Application, CollapsibleSection, Spinner } from '@spinnaker/core';

import { IEcsTargetGroup, IEcsLoadBalancer } from '../../domain/IEcsLoadBalancer';

interface IEcsTargetGroupFromStateParams {
  loadBalancerName: string;
  targetGroupName: string;
  region: string;
  vpcId: string;
}

interface IEcsTargetGroupDetailsState {
  loadBalancer: IEcsLoadBalancer;
  targetGroup: IEcsTargetGroup;
  targetGroupNotFound?: string;
  loading: boolean;
  refreshListenerUnsubscribe: () => void;
}

export interface IEcsTargetGroupProps {
  app: Application;
  accountId: string;
  name: string;
  targetGroup: IEcsTargetGroupFromStateParams;
  provider: string;
}

export class EcsTargetGroupDetails extends React.Component<IEcsTargetGroupProps, IEcsTargetGroupDetailsState> {
  constructor(props: IEcsTargetGroupProps) {
    super(props);
    this.state = {
      loading: true,
      targetGroup: undefined,
      loadBalancer: undefined,
      refreshListenerUnsubscribe: () => {},
    };
    console.log('TARGET GROUP Details PROPS:'); // eslint-disable-line
    console.log(props); // eslint-disable-line

    // extract LB
    props.app
      .getDataSource('loadBalancers')
      .ready()
      .then(() => this.extractTargetGroup());
  }

  public componentWillUnmount(): void {
    this.state.refreshListenerUnsubscribe();
  }

  private extractTargetGroup(): void {
    const { loadBalancerName, region, targetGroupName } = this.props.targetGroup;
    const loadBalancer: IEcsLoadBalancer = this.props.app
      .getDataSource('loadBalancers')
      .data.find((test: IEcsLoadBalancer) => {
        return test.name === loadBalancerName && test.account === this.props.accountId && test.region === region;
      });

    this.setState({
      loadBalancer,
    });
    this.state.refreshListenerUnsubscribe();

    console.log('TARGET GROUP Details retrieved LB:'); // eslint-disable-line
    console.log(loadBalancer); // eslint-disable-line

    if (!loadBalancer) {
      this.setState({
        loading: false,
        targetGroup: null,
      });
    } else {
      const targetGroup: IEcsTargetGroup = loadBalancer.targetGroups.find(tg => tg.targetGroupName === targetGroupName);
      if (!targetGroup) {
        // do the same thing
      }

      if (targetGroup) {
        this.setState({
          loading: false,
          targetGroup,
        });

        if (targetGroup) {
          this.setState({
            refreshListenerUnsubscribe: this.props.app
              .getDataSource('loadBalancers')
              .onRefresh(null, () => this.extractTargetGroup()),
          });
        } else {
          this.setState({
            refreshListenerUnsubscribe: () => {},
          });
        }
      }

      console.log('TARGET GROUP Details retrieved TG:'); // eslint-disable-line
      console.log(targetGroup); // eslint-disable-line
    }
  }

  // fix so not any
  public render(): React.ReactElement<EcsTargetGroupDetails> {
    //console.log('Props for TG details are:'); // eslint-disable-line
    //console.log(this.props); // eslint-disable-line

    const { name, accountId } = this.props;
    const loadBalancerName = this.props.targetGroup.loadBalancerName;
    const { targetGroup, loadBalancer, loading } = this.state;

    const CloseButton = (
      <div className="close-button">
        <UISref to="^">
          <span className="glyphicon glyphicon-remove" />
        </UISref>
      </div>
    );

    const loadingHeader = () => (
      <div className="header">
        {CloseButton}
        <div className="horizontal center middle">
          <Spinner size="small" />
        </div>
      </div>
    );

    const notFoundHeader = () => (
      <div className="header">
        <h3>Target group not found.</h3>
      </div>
    );

    const targetGroupHeader = () => (
      <div className="header">
        <div className="header-text horizontal middle">
          <i className="fa fa-crosshairs icon" aria-hidden="true"></i>
          <h3 className="horizontal middle space-between flex-1" select-on-dbl-click>
            {name}
          </h3>
        </div>
      </div>
    );

    const targetGroupContent = () => (
      <div className="content">
        <CollapsibleSection heading="Target Group Details" defaultExpanded={true}>
          <dl className="dl-horizontal dl-flex">
            <dt>In</dt>
            <dd>
              <AccountTag account={accountId}></AccountTag>
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
            <dd>TBD! Find this</dd>
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
                <a>{loadBalancerName}</a>
                {/* </UISref> */}
              </ul>
            </dd>
          </dl>
          <dl className="horizontal-when-filters-collapsed">
            <dt>Load Balancer DNS Name</dt>
            <dd>
              <a target="_blank" href={'http://' + loadBalancer.dnsname}>
                {loadBalancer.dnsname}
              </a>
            </dd>
          </dl>
          <dl className="horizontal-when-filters-collapsed">
            <dt>Server Groups</dt>
            <dd>
              <ul>
                <li>TBD</li>
              </ul>
            </dd>
          </dl>
        </CollapsibleSection>
        <CollapsibleSection heading="Status" defaultExpanded={false}></CollapsibleSection>
        <CollapsibleSection heading="Health Checks" defaultExpanded={false}>
          <dl className="horizontal-when-filters-collapsed">
            <dt>Target</dt>
            <dd>
              {targetGroup.healthCheckProtocol}:{targetGroup.healthCheckPort}
              {targetGroup.healthCheckPath}
            </dd>
            <dt>Timeout</dt>
            <dd>{targetGroup.healthCheckTimeoutSeconds} seconds</dd>
            <dt>Interval</dt>
            <dd>{targetGroup.healthCheckIntervalSeconds} seconds</dd>
            <dt>Healthy Threshold</dt>
            <dd>{targetGroup.healthyThresholdCount}</dd>
            <dt>Unhealthy Threshold</dt>
            <dd>{targetGroup.unhealthyThresholdCount}</dd>
            <dt>Matcher</dt>
            <dd>HTTP Code(s): {targetGroup.matcher.httpCode}</dd>
          </dl>
        </CollapsibleSection>
        <CollapsibleSection heading="Attributes" defaultExpanded={false}>
          <dl>
            <dt>Deregistration Delay Timeout</dt>
            <dd>{targetGroup.attributes['deregistration_delay.timeout_seconds']} seconds</dd>
            <dt>Stickiness Enabled</dt>
            <dd>{targetGroup.attributes['stickiness.enabled']}</dd>
          </dl>
        </CollapsibleSection>
      </div>
    );

    return (
      <div className="details-panel">
        {loading && loadingHeader()}
        {!loading && targetGroupHeader()}
        {!loading && targetGroupContent()}
        {!loading && !targetGroup && notFoundHeader()}
      </div>
    );
  }
}
