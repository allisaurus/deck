'use strict';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.ecs.serverGroup.configure.wizard.taskDefinition.component', [])
  .component('ecsServerGroupTaskDefinition', {
    bindings: {
      command: '=',
      application: '=',
    },
    templateUrl: require('./taskDefinition.component.html'),
  });
