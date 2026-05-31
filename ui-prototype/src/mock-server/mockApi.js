import {
  burnupSeries,
  estimateTargets,
  members,
  resourceItems,
  typeColors,
  workTree
} from './fixtures/prototypeFixture.js';

const mockDatabase = {
  members,
  typeColors,
  workTree,
  resourceItems,
  burnupSeries,
  estimateTargets
};

export const mockApi = {
  getSnapshot() {
    return mockDatabase;
  },
  dashboard: {
    getBurnupSeries() {
      return mockDatabase.burnupSeries;
    },
    getEstimateTargets() {
      return mockDatabase.estimateTargets;
    }
  },
  resources: {
    getResourceSnapshot() {
      return {
        members: mockDatabase.members,
        resourceItems: mockDatabase.resourceItems,
        workTree: mockDatabase.workTree,
        typeColors: mockDatabase.typeColors
      };
    },
    getResourceItems() {
      return mockDatabase.resourceItems;
    }
  },
  tasks: {
    getWorkTree() {
      return mockDatabase.workTree;
    }
  },
  master: {
    getMembers() {
      return mockDatabase.members;
    },
    getTypeColors() {
      return mockDatabase.typeColors;
    }
  }
};
