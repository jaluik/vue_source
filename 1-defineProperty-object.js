/**
 *这里每个sub的类型其实就是下面定义的watcher类型
 */
class Dep {
  constructor() {
    this.subs = [];
  }
  addSub(sub) {
    this.subs.push(sub);
  }
  removeSub(sub) {
    return this.subs.filter((item) => item !== sub);
  }
  depend() {
    if (window.target) {
      this.addSub(window.target);
    }
  }
  notify() {
    this.subs.forEach((item) => {
      item.update();
    });
  }
}

/** window.target
 *
 * 这里我们规定为wathcer
 * wathcer 有个经典的使用范式
 * vim.$wathc(a.b,c, (new, old)=> {
 * })
 */
class Wathcer {
  constructor(vim, exporOrFn, cb) {
    this.vim = vim;
    this.getter = parsePath(exporOrFn);
    this.cb = cb;
    this.value = this.get();
  }
  get() {
    window.target = this;
    const value = this.getter.call(this.vim, this.vim);
    window.target = undefined;
    return value;
  }
  update() {
    const oldVal = this.value;
    this.value = this.get();
    this.cb.call(this.vim, oldVal, newVal);
  }
}

function parsePath(path) {
  if (/[^\w.$]/.test(path)) {
    return;
  }
  return function (obj) {
    const key = path.split('.');
    key.forEach((item) => {
      if (!obj) return;
      obj = obj[item];
    });
    return obj;
  };
}

class Observer {
  constructor(value) {
    this.value = value;
    // 注意这里的现在只针对了object类型，没有考虑数组类型
    if (!Array.isArray(value)) {
      this.walk(value);
    }
  }
  walk(value) {
    const keys = Object.keys(value);
    keys.forEach((key) => {
      defineReactive(value, key, value[key]);
    });
  }
}

function defineReactive(data, key, val) {
  if (typeof data === 'object') {
    new Observer(val);
  }
  const dep = new Dep();
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    // 在get收集依赖
    get() {
      dep.depend();
      return val;
    },
    // 在set中出发依赖
    set(newVal) {
      if (val === newVal) {
        return;
      }
      dep.notify();
      val = newVal;
    },
  });
}

/**
 * 总结：
 * 执行流程
 * 使用方法
 * vim.$watch('a.b.c', (newVal, oldVal)=>{
 *  //TODO
 * })
 *
 * 此时vim会创建一个watch的实例，这是由于watch实例会递归访问 a.b.c的属性，那么这个时候就会通过我们定义的函数
 * defineReactive行数来递归的给每个属性添加deps，并且为每个deps添加了 this.watch这个实例的依赖
 * 这样相当于注册了依赖，并且只需要在update定义watch到变化后需要采用的回调函数
 * 那么一旦目标数据发生变化，就会自动调用update函数
 *
 *
 *
 */
