const PRICE = {
	S: 10, // 十
	B: 100, // 百
	K: 1000, // 千
	w: 10000 // 万
}

/**
 *  options 里面的属性
 *  type =》 String Number Boolean Date Array Object
 *   property 映射后端数据的字段名
 *  value 默认值。
 *  useCallback =》 是否使用回调函数。
 *  callback 回调函数用于处理特殊需求
 *  changeType 转换类型
 *  changeParams 转换函数需要的参数
 * */
class Model {
	constructor(options = {}) {
		this._attributes = {
			...options
		}
	}

	/**
	 * 根据初始定义的模型，解析模型，进行变量映射赋值
	 * @param {*} data 需要解析的数据
	 */
	parse(data = {}) {
		let val = _.mapValues(this._attributes, (attribute, key) => {
			let path = attribute.property || key,
				type = new attribute.type(),
				changeType = attribute.changeType,
				changeParams = attribute.changeParams
			let distValue = _.get(data, path)
			if (distValue) {
				if (attribute.useCallback) {
					if (typeof this._attributes[key].callback === 'function') {
						distValue = this._attributes[key].callback(distValue)
					} else {
						new Error('callback 不是函数')
					}
				} else {
					distValue = this.compose(distValue, type, changeType, changeParams)
				}
			}
			return distValue || this.getDefaultValue(attribute.value, attribute.type)
		})
		return {...this.filterObject(data), ...val}
	}

	/**
	 *根据初始定义的模型，反向映射数据
	 * @param {*} data 需要转化的数据
	 */
	traverse(data = {}) {
		if (!data) return this
		let object = {}
		_.mapValues(this._attributes, (attribute, key) => {
			let path = attribute.property || key,
				changeType = attribute.changeType,
				type = new attribute.type(),
				sourceValue = data[key]
			if (sourceValue) {
				sourceValue = this.discompose(sourceValue, changeType, key, type)
			}
			if (path.indexOf('.') === -1 && path.indexOf('[') === -1) {
				_.set(object, path, sourceValue)
			}
		})
		return {...this.filterObject(data, false), ...object}
	}

	/**
	 *  格式化特殊类型的值，比如时间的格式化，价格的格式化
	 * @param {*} distValue 值
	 * @param {*} type 类型，比如String,Number
	 * @param {*} changeType 单位，比如价格
	 */
	compose(distValue, type, changeType, changeParams) {
		if (changeType) {
			distValue = distValue / PRICE[changeType]
		}
		if (_.isDate(type)) {
			distValue = this.dateFormat(distValue, ...changeParams)
		}
		return distValue
	}

	/**
	 * 和compose方法类似，这里是反向转化
	 * @param {*} sourceValue
	 * @param {*} changeType
	 * @param {*} key
	 * @param {*} type
	 */
	discompose(sourceValue, changeType, key, type) {
		if (_.isDate(type)) {
			sourceValue = new Date(sourceValue).valueOf()
		}
		if (changeType) {
			sourceValue = sourceValue * PRICE[changeType]
		}
		return sourceValue
	}

	/**
	 * 获取默认值
	 * @param {*} value
	 * @param {*} type
	 */
	getDefaultValue(value, type) {
		if (!value) {
			return this.setDefaultValue(type)
		} else {
			return value
		}
	}

	/**
	 * 设置默认值
	 * @param {*} Type
	 */
	setDefaultValue(Type) {
		let value = '',
			type = new Type()
		if (_.isNumber(type)) {
			value = 0
		} else if (_.isString(type)) {
			value = ''
		} else if (_.isArray(type)) {
			value = []
		} else if (_.isBoolean(type)) {
			value = false
		} else if (_.isDate(type)) {
			value = Date.now()
		}

		return value
	}

	/**
	 * 过滤数组，去掉指定的键。避免重复
	 * @param {*} state  true =》 映射，false =》反相映射
	 * @param {*} objectVal 需要过滤的对象
	 */
	filterObject(objectVal, state = true) {
		let newObject = {}
		let keys = []
		if (state) {
			let newKeys = Object.keys(this._attributes)
			newKeys.forEach(item => {
				keys.push(this._attributes[item].property || item)
			})
		} else {
			keys = Object.keys(this._attributes)
		}
		if (keys instanceof Array && objectVal instanceof Object) {
			for (let key in objectVal) {
				if (keys.indexOf(key) === -1 || typeof objectVal[key] === 'object') {
					newObject[key] = objectVal[key]
				}
			}
			console.log(newObject, keys)
			return newObject
		}
	}

	/**
	 * 日期转换函数
	 * params {*} data 值。
	 * params {*} sep 分隔符
	 *params {*}  type 类型 y ym ymd all
	 * */
	dateFormat(data = new Date(), sep = '-', type = 'ymd') {
		// 用于格式化时间
		const date = new Date(data)
		const y = date.getFullYear()
		const m = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)
		const d = date.getDate() > 9 ? date.getDate() : '0' + date.getDate()
		const t = (date.getHours() > 9 ? date.getHours() : '0' + date.getHours()) + ':' +
			(date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()) + ':' +
			(date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds())
		if (type === 'y') {
			return y
		}
		if (type === 'ym') {
			return y + sep + m
		}
		if (type === 'ymd') {
			return y + sep + m + sep + d
		}
		if (type === 'all') {
			return y + sep + m + sep + d + ' ' + t
		}
	}
}
