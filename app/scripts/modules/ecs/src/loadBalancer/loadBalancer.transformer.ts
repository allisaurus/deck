export class EcsLoadBalancerTransformer {
  public normalizeLoadBalancer(input: any): any {
    console.log('ECS transformer:'); // eslint-disable-line
    console.log(input); // eslint-disable-line

    return input;
  }
}
