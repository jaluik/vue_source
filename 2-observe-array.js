/**
 * 观察array数组中的数据变化
 * 实现方式是使用覆盖原型链的方式
 *
 * array原型链中的方法主要有7个，包括push, pop. shift, unshift, splice, sort, reverse.
 * 我们只需要覆盖这七个方法，就可以让vue监听到数组的变化
 *
 */
const arrayProto = Array.prototype;

const arrayMethods = Object.create(arrayProto);

['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(
  (method) => {
    const originMethod = arrayProto[method];
    Object.defineProperty(arrayMethods, method, {
      value: function mutator(...args) {
        return originMethod.apply(this, args);
      },
      enumerable: false,
      writable: true,
      configurable: true,
    });
  }
);

/**
 * 这里针对数组我们需要重写一些方法来实现
 * 订阅的效果
 *
 */
const hasProto = '__proto__' in {};
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

class Observer {
  constructor(val) {
    this.value = val;
    def(val, '__ob__', this);
    if (Array.isArray(val)) {
      const augment = hasProto ? protoAugment : copyAugment;
      augment(val, arrayMethods, arrayKeys);
    } else {
      this, walk(val);
    }
  }
}

/** 原型继承 */
function protoAugment(target, src) {
  target.__proto__ = src;
}

/** 每个属性进行代理 */
function copyAugment(target, src, keys) {
  keys.forEach((key) => {
    def(target, key, src[key]);
  });
}

/** 此工具函数用于代理取值 */
function def(target, key, val, enumerable) {
  Object.defineProperty(target, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}
