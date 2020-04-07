import { ILoadBalancer, IInstance, IInstanceCounts } from '@spinnaker/core';

export type IListenerActionType =
  | 'forward'
  | 'authenticate-oidc'
  | 'redirect'
  | 'authenticate-cognito'
  | 'fixed-response';

export interface IEcsLoadBalancer extends ILoadBalancer {
  name: string;
  account: string;
  availabilityZones: string[];
  cloudProvider: string;
  createdTime: number;
  dnsname: string;
  listeners: IALBListener[];
  targetGroups: IEcsTargetGroup[];
  ipAddressType?: string; // returned from clouddriver
  deletionProtection: boolean;
  idleTimeout: number;
  loadBalancerType: string;
  securityGroups: string[];
  subnets?: string[];
  region: string;
  vpcId: string;
}

export interface IEcsLoadBalancerSourceData extends IEcsLoadBalancer {
  targetGroupServices: { [key: string]: string[] };
}

export interface IEcsTargetGroup {
  account: string;
  attributes?: any;
  cloudProvider: string;
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
  loadBalancerNames: string[];
  matcher: any;
  targetGroupArn: string;
  targetGroupName: string;
  port: number;
  protocol: string;
  provider?: string;
  region: string;
  serverGroups?: string[];
  targetType?: string;
  type: string; // returned from clouddriver
  vpcId?: string;
  vpcName?: string;
}

export interface IALBListener {
  certificates: any[];
  defaultActions: IListenerAction[];
  port: number;
  protocol: string;
  rules: any[]; // TODO: use & define IListenerRule
  sslPolicy?: string;
}

// see https://docs.aws.amazon.com/elasticloadbalancing/latest/APIReference/API_Action.html
export interface IListenerAction {
  authenticateOidcConfig?: IAuthenticateOidcActionConfig;
  order?: number;
  forwardConfig?: IForwardConfig;
  fixedResponseConfig?: IFixedResponseConfig;
  redirectConfig?: IRedirectActionConfig;
  targetGroupArn?: string;
  type: IListenerActionType;
}

export interface IAuthenticateOidcActionConfig {
  authorizationEndpoint: string;
  authenticationRequestExtraParams?: any;
  clientId: string;
  clientSecret?: string;
  idpLogoutUrl?: string;
  issuer: string;
  scope: string;
  sessionCookieName: string;
  sessionTimeout?: number;
  tokenEndpoint: string;
  userInfoEndpoint: string;
}

export interface IForwardConfig {
  targetGroups?: { targetGroupArn: string; weight: number }[];
}

export interface IFixedResponseConfig {
  statusCode: string;
  messageBody?: string;
  contentType?: string;
}

export interface IRedirectActionConfig {
  host?: string;
  path?: string;
  port?: string;
  protocol?: 'HTTP' | 'HTTPS' | '#{protocol}';
  query?: string;
  statusCode: 'HTTP_301' | 'HTTP_302';
}
