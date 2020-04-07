import React from 'react';
import { UISref } from '@uirouter/react';
import { AccountTag, Application, CollapsibleSection, timestamp, Spinner } from '@spinnaker/core';

import { IEcsLoadBalancer } from '../domain/IEcsLoadBalancer';

interface IEcsLoadBalancerFromStateParams {
  accountId: string;
  region: string;
  name: string;
  vpcId: string;
}

interface IEcsLoadBalancerDetailsState {
  loadBalancer: IEcsLoadBalancer;
  loadBalancerNotFound?: string;
  loading: boolean;
  refreshListenerUnsubscribe: () => void;
}

export interface IEcsLoadBalancerDetailsProps {
  app: Application;
  accountId: string;
  loadBalancer: IEcsLoadBalancerFromStateParams;
}

// use @UIRouterContext? maybein targetGroupDetails?
// TODO ALLIE: add load balancer actions - edit, delete?
export class EcsLoadBalancerDetails extends React.Component<
  IEcsLoadBalancerDetailsProps,
  IEcsLoadBalancerDetailsState
> {
  constructor(props: IEcsLoadBalancerDetailsProps) {
    super(props);
    this.state = {
      loading: true,
      loadBalancer: undefined,
      refreshListenerUnsubscribe: () => {},
    };
    console.log('EcsLoadBalancerDetails PROPS:'); // eslint-disable-line
    console.log(props); // eslint-disable-line

    // extract LB
    props.app
      .getDataSource('loadBalancers')
      .ready()
      .then(() => this.extractLoadBalancer());

    // TODO retireve load balancer details with [app.getDataSource('loadBalancers')]
    // ...see LoadBalancers.tsx  |  how does cloudfoundry do it?
  }

  private extractLoadBalancer(): void {
    const { name } = this.props.loadBalancer;
    const loadBalancer: IEcsLoadBalancer = this.props.app
      .getDataSource('loadBalancers')
      .data.find((test: IEcsLoadBalancer) => {
        return test.name === name && test.account === this.props.loadBalancer.accountId;
      });

    this.setState({
      loading: false,
      loadBalancer,
    });
    this.state.refreshListenerUnsubscribe();

    if (loadBalancer) {
      this.setState({
        refreshListenerUnsubscribe: this.props.app
          .getDataSource('loadBalancers')
          .onRefresh(null, () => this.extractLoadBalancer()),
      });
    } else {
      this.setState({
        refreshListenerUnsubscribe: () => {},
      });
      // this.autoClose();
    }

    console.log('EcsLoadBalancerDetails retrieved LB:'); // eslint-disable-line
    console.log(loadBalancer); // eslint-disable-line
  }

  public render(): React.ReactElement<EcsLoadBalancerDetails> {
    const { loadBalancer, loading } = this.state;
    const { accountId } = this.props;

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

    const loadBalancerHeader = () => (
      <div className="header">
        {CloseButton}
        <div className="header-text horizontal middle">
          <i className="fa icon-sitemap" />
          <h3 className="horizontal middle space-between flex-1">{loadBalancer.name}</h3>
        </div>
      </div>
    );

    const loadBalancerContent = () => (
      <div className="content">
        <CollapsibleSection heading="Load Balancer Details" defaultExpanded={true}>
          <dl className="dl-horizontal dl-flex">
            <dt>Created</dt>
            <dd>{timestamp(loadBalancer.createdTime)}</dd>
            <dt>In</dt>
            <dd>
              <AccountTag account={accountId} />
              <br />
              {loadBalancer.region}
            </dd>
            <dt>VPC</dt>
            <dd>{loadBalancer.vpcId}</dd>
            <dt>Type</dt>
            <dd>{loadBalancer.loadBalancerType}</dd>
            <dt>IP Type</dt>
            <dd>{loadBalancer.ipAddressType}</dd>
          </dl>
          <dl className="horizontal-when-filters-collapsed">
            <dt>Availability Zones</dt>
            <dd>
              <ul>
                {loadBalancer.availabilityZones.map((az, index) => {
                  return <li key={index}>{az}</li>;
                })}
              </ul>
            </dd>
          </dl>
          <dl className="horizontal-when-filters-collapsed">
            <dt>Target Groups</dt>
            <dd>
              <ul>
                {loadBalancer.targetGroups.map((tg, index) => {
                  return (
                    <li key={index}>
                      <UISref
                        to="^.ecsTargetGroupDetails"
                        params={{
                          loadBalancerName: loadBalancer.name,
                          region: loadBalancer.region,
                          accountId: loadBalancer.account,
                          name: tg.targetGroupName,
                          vpcId: tg.vpcId,
                          provider: loadBalancer.cloudProvider,
                        }}
                      >
                        <a>{tg.targetGroupName}</a>
                      </UISref>
                    </li>
                  );
                })}
              </ul>
            </dd>
          </dl>
          <dl className="horizontal-when-filters-collapsed">
            <dt>DNS Name</dt>
            <dd>
              <a target="_blank" href={'http://' + loadBalancer.dnsname}>
                {loadBalancer.dnsname}
              </a>
            </dd>
          </dl>
        </CollapsibleSection>
        <CollapsibleSection heading="Status" defaultExpanded={false}>
          <span>Select a target group to check the instance health status from the view of the target group.</span>
        </CollapsibleSection>
        <CollapsibleSection heading="Listeners" defaultExpanded={false}>
          {loadBalancer.listeners.map((listener, index) => {
            return (
              <div>
                <span key={index}>
                  {listener.protocol}:{listener.port}
                </span>
                <ul>
                  <li>
                    {listener.defaultActions[0].type} ->{' '}
                    {listener.defaultActions[0].forwardConfig.targetGroups[0].targetGroupArn}
                  </li>
                  {/* {listener.defaultActions.map((action, i) => {
                      return (
                      <span key={i}>{action.type} -></span>
                      );
                    })} */}
                </ul>
              </div>
            );
          })}
        </CollapsibleSection>
        <CollapsibleSection heading="Firewalls" defaultExpanded={false}>
          <ul>
            {loadBalancer.securityGroups.map((sg, index) => {
              return <li key={index}>{sg}</li>;
            })}
          </ul>
        </CollapsibleSection>
        <CollapsibleSection heading="Subnets" defaultExpanded={false}>
          <ul>
            {loadBalancer.subnets.map((subnet, index) => {
              return <li key={index}>{subnet}</li>;
            })}
          </ul>
        </CollapsibleSection>
      </div>
    );

    return (
      <div className="details-panel">
        {loading && loadingHeader()}
        {!loading && loadBalancerHeader()}
        {!loading && loadBalancerContent()}
      </div>
    );
  }
}
