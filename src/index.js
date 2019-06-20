/** 创建dom */
const dom = (type, props, ...children) => {
  return {
    type,
    props,
    children
  }
}

/** 生成dom节点 */
const generateDom = (domObj) => {
  let $el;
  // 1.创建dom元素
  if (domObj.type) {
    $el = document.createElement(domObj.type);
  } else {
    $el = document.createTextNode(domObj);
  }

  // 2.添加属性
  if (domObj.props) {
    Object.keys(domObj.props).forEach(key => {
      $el.setAttribute(key, domObj.props[key]);
    });
  }

  // 3.添加子节点
  if (domObj.children) {
    domObj.children.forEach(child => {
      $el.appendChild(generateDom(child));
    });
  }

  return $el;
}

/** 数据类型 */
const types = {
  get: type => Object.prototype.toString.call(type),
  string: '[object String]',
  number: '[object Number]',
  array: '[object Array]',
  object: '[object Object]',
  function: '[object Function]',
  null: '[object Null]',
  undefined: '[object Undefined]',
  boolean: '[object Boolean]',
}

/** 对比dom */
const isNodeChange = (oldNode, newNode) => {
  // 1.type变化
  if (types.get(oldNode) === types.object && types.get(newNode) === types.object) {
    return oldNode.type !== newNode.type;
  }

  return oldNode !== newNode;
}

/** 对比 */
const isObjectChange = (obj1, obj2) => {
  // 1.判断type是否一致
  if (types.get(obj1) !== types.get(obj2)) {
    return true;
  }
  // 2.深入判断
  if (types.get(obj1) ==types.object) {
    const obj1Keys = Object.keys(obj1);
    const obj2Keys = Object.keys(obj2);

    // key长度不一样
    if (obj1Keys.length != obj2Keys.length) {
      return true;
    }
    if (obj1Keys.length === 0) {
      return false;
    }

    const keys = new Set([...obj1Keys, ...obj2Keys]);
    for (let key of keys) {
      if (obj1[key] !== obj2[key]) {
        return true;
      }
    }
  }

  return false;
}

/** 虚拟dom */
const vDom = ($parent, oldNode, newNode, index = 0) => {
  // 1.两个节点相同,不处理
  if (oldNode === newNode) {
    return;
  }

  const $currentNode = $parent.childNodes[index];
  // 2.oldNode为空,则新加节点
  if (!oldNode) {
    return $parent.appendChild(generateDom(newNode));
  }
  // 3.oldNode有值,newNode为空,则删除oldNode
  if (!newNode) {
    return $parent.removeChild($currentNode);
  }
  // 4.oldNode,newNode不为空,则比对节点
  if (isNodeChange(oldNode, newNode)) {
    return $parent.replaceChild(generateDom(newNode), $currentNode);
  }
  // 5.比对props
  if (isObjectChange(oldNode.props, newNode.props)) {
    const oldProps = oldNode.props || {};
    const newProps = newNode.props || {};
    const oldPropsKeys = Object.keys(oldProps);
    const newPropsKeys = Object.keys(newProps);

    // 1.newProps为空,删除oldNode的所有props
    if (!newPropsKeys.length) {
      oldPropsKeys.forEach(key => {
        $currentNode.removeAttribute(key);
      });
    } else {
      const keys = new Set([...oldPropsKeys, ...newPropsKeys]);
      keys.forEach(key => {
        // oldprops没有时,添加
        if (!oldProps[key]) {
          $currentNode.setAttribute(key, newProps[key]);
        }
        // newprops没有时删除
        if (!newProps[key]) {
          $currentNode.removeAttribute(key);
        }
        // 值不同时替换
        if (oldProps[key] !== newProps[key]) {
          $currentNode.setAttribute(key, newProps[key]);
        }
      })
    }
  }
  // 6.对比子节点
  if ((oldNode.children && oldNode.children.length) || (newNode.children && newNode.children.length)) {
    const max = Math.max(oldNode.children.length, newNode.children.length);
    for (let i = 0; i < max; ++i) {
      vDom($currentNode, oldNode.children[i], newNode.children[i], i);
    }
  }
}

const $root = document.getElementById('root');
const oldNode = null;
const newNode = <div class="text"><p style="color:red">add node</p></div>;
vDom($root, oldNode, newNode, 0);

// setTimeout(() => {
//   let oldNode = <div class="text"><p style="color:red">add node</p></div>;
//   let newNode = null;
//   vDom($root, oldNode, newNode, 0);
// }, 2000);
const changeChildNode = <div class="text"><p style="color:blue">add node</p></div>;
setTimeout(() => {
  // oldNode = <div class="text"><p style="color:red">add node</p></div>;
  vDom($root, newNode, changeChildNode, 0);
}, 5000);
