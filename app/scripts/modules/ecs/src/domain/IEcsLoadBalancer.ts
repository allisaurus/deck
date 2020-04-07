import { ILoadBalancer, IInstance, IInstanceCounts } from '@spinnaker/core';

export interface IEcsLoadBalancer extends ILoadBalancer {
  name: string;
  account: string;
  availabilityZones: string[];
  cloudProvider: string;
  dnsname: string;
  listeners: IALBListener[];
  targetGroups: IEcsTargetGroup[];
  ipAddressType?: string; // returned from clouddriver
  deletionProtection: boolean;
  idleTimeout: number;
  loadBalancerType: string;
  region: string;
}

export interface IEcsTargetGroup {
  account: string; // returned from clouddriver
  attributes?: any; // was ITargetGroupAttributes
  cloudProvider: string; // returned from clouddriver
  createdTime: number;
  detachedInstances?: IInstance[];
  healthCheckProtocol: string;
  healthCheckPort: number | 'traffic-port';
  healthCheckPath: string;
  healthCheckTimeoutSeconds: number;
  healthCheckIntervalSeconds: number;
  healthyThresholdCount: number;
  unhealthyThresholdCount: number;
  instanceCounts?: IInstanceCounts;
  instances?: IInstance[];
  loadBalancerNames: string[]; // returned from clouddriver
  matcher: any;
  targetGroupName: string; // TODO ALLIE change to 'name'?
  port: number;
  protocol: string;
  provider?: string;
  region: string; // returned from clouddriver
  serverGroups?: any[]; // was IAmazonServerGroup[]
  targetType?: string;
  type: string; // returned from clouddriver
  vpcId?: string;
  vpcName?: string;
}

export interface IALBListener {
  certificates: any[]; // was IALBListenerCertificate[]
  defaultActions: any[]; // was IListenerAction[]
  port: number;
  protocol: string;
  rules: IListenerRule[];
  sslPolicy?: string;
}

export interface IListenerRule {
  actions: any[]; // was IListenerAction[]
  default?: boolean;
  conditions: any[]; // was IListenerRuleCondition[]
  priority: number | 'default';
}
