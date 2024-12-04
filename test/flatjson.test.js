

const { expect } = require('chai');
const sinon = require('sinon');
const JsonManager = require('../index').JsonManager; // Replace with the path to your implementation

describe('JsonManager', function () {
  let manager;

  beforeEach(function () {
    manager = new JsonManager();
  });

  describe('read', function () {
    it('should return undefined if the key does not exist and createKey is false', function () {
      expect(manager.read('nonexistent', false)).to.be.undefined;
    });

    it('should create a key with null value if createKey is true', function () {
      expect(manager.read('newKey', true)).to.be.null;
      expect(manager.dump()).to.have.property('newKey', null);
    });

    it('should return the value of an existing key', function () {
      manager.write('key1', 'value1');
      expect(manager.read('key1')).to.equal('value1');
    });
  });

  describe('write', function () {
    it('should set the value of a key', function () {
      manager.write('key1', 'value1');
      expect(manager.dump()).to.have.property('key1', 'value1');
    });
  });

  describe('dump', function () {
    it('should return a shallow copy of the data', function () {
      manager.write('key1', 'value1');
      const dumpedData = manager.dump();
      expect(dumpedData).to.deep.equal({ key1: 'value1' });
      dumpedData.key1 = 'modifiedValue';
      expect(manager.getKey('key1')).to.equal('value1');
    });
  });

  describe('hasKey', function () {
    it('should return true if a key exists', function () {
      manager.write('key1', 'value1');
      expect(manager.hasKey('key1')).to.be.true;
    });

    it('should return false if a key does not exist', function () {
      expect(manager.hasKey('nonexistent')).to.be.false;
    });
  });

  describe('getKey', function () {
    it('should return the value of an existing key', function () {
      manager.write('key1', 'value1');
      expect(manager.getKey('key1')).to.equal('value1');
    });

    it('should return undefined for a nonexistent key', function () {
      expect(manager.getKey('nonexistent')).to.be.undefined;
    });
  });

  describe('search', function () {
    beforeEach(function () {
      manager.write('key1', 'value1');
      manager.write('key2', 'value2');
      manager.write('keyWithValue1', 'value1');
    });

    it('should return key-value pairs for an exact key match', function () {
      expect(manager.search('key1')).to.deep.equal([{ key: 'key1', value: 'value1' }]);
    });

    it('should return key-value pairs for keys in an array', function () {
      expect(manager.search(['key1', 'keyWithValue1'])).to.deep.equal([
        { key: 'key1', value: 'value1' },
        { key: 'keyWithValue1', value: 'value1' },
      ]);
    });

    it('should return key-value pairs for partial key matches', function () {
      expect(manager.search('key', { like: true })).to.deep.equal([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'keyWithValue1', value: 'value1' },
      ]);
    });

    it('should return key-value pairs for regex key matches', function () {
      expect(manager.search('^key\\d$', { regex: true })).to.deep.equal([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
      ]);
    });
  });

  describe('searchKeyValue', function () {
    beforeEach(function () {
      manager.write('key1', 'value1');
      manager.write('key2', 'value2');
      manager.write('keyWithValue1', 'value1');
    });

    it('should return key-value pairs for exact key or value matches', function () {
      expect(manager.searchKeyValue('value1')).to.deep.equal([
        { key: 'key1', value: 'value1' },
        { key: 'keyWithValue1', value: 'value1' },
      ]);
    });

    it('should return key-value pairs for keys or values in an array', function () {
      expect(manager.searchKeyValue(['key1', 'value2'])).to.deep.equal([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
      ]);
    });

    it('should return key-value pairs for partial key or value matches', function () {
      expect(manager.searchKeyValue('value', { like: true })).to.deep.equal([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'keyWithValue1', value: 'value1' },
      ]);
    });

    it('should return key-value pairs for regex key or value matches', function () {
      expect(manager.searchKeyValue('^value\\d$', { regex: true })).to.deep.equal([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'keyWithValue1', value: 'value1' },
      ]);
    });
  });

  describe('searchValue', function () {
    beforeEach(function () {
      manager.write('key1', 'value1');
      manager.write('key2', 'value2');
      manager.write('keyWithValue1', 'value1');
    });

    it('should return key-value pairs for an exact value match', function () {
      expect(manager.searchValue('value1')).to.deep.equal([
        { key: 'key1', value: 'value1' },
        { key: 'keyWithValue1', value: 'value1' },
      ]);
    });

    it('should return key-value pairs for values in an array', function () {
      expect(manager.searchValue(['value1', 'value2'])).to.deep.equal([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'keyWithValue1', value: 'value1' },
      ]);
    });

    it('should return key-value pairs for partial value matches', function () {
      expect(manager.searchValue('value', { like: true })).to.deep.equal([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'keyWithValue1', value: 'value1' },
      ]);
    });

    it('should return key-value pairs for regex value matches', function () {
      expect(manager.searchValue('^value\\d$', { regex: true })).to.deep.equal([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'keyWithValue1', value: 'value1' },
      ]);
    });
  });
});

