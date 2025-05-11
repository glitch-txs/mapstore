type K<T> = Extract<keyof T, string>
type V<T> = T[Extract<keyof T, string>]

export class Store<TStore extends Object> extends Map<K<TStore>, V<TStore>> {
  callbacks = new Map<K<TStore>, Set<(prev: V<TStore>)=> unknown>>()
  onCallbacks(key: K<TStore>, value: V<TStore>){
    this.callbacks.get(key)?.forEach(callback => callback(value))
  }

  constructor(initialValues: TStore) {
    for (const key of Object.keys(initialValues)) {
      if (key === '__proto__' || key === 'constructor') {
        throw new Error(`Invalid key "${key}"`)
      }
    }
  
    super(Object.entries(initialValues) as [K<TStore>, V<TStore>][])
  }

  set(key: K<TStore>, value: V<TStore>) {
    const prev = this.get(key)
    if(prev === value) return this
    
    super.set(key, value)
    this.onCallbacks(key, value)
    return this
  }

  update(key: K<TStore>, value: (prev: V<TStore>)=> V<TStore>) {
    if(!this.has(key)) throw Error(`Calling update: "${key}" was not initialized.`)
    const prev = this.get(key) as V<TStore>
    const _newVal = value(prev)
    if(prev === _newVal) return

    super.set(key, _newVal)
    this.onCallbacks(key, _newVal)
    return this
  }

  subscribe(key: K<TStore>, callback: (prev: V<TStore>)=> unknown) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function')
    }
    const callbacks = this.callbacks.get(key) ?? new Set()
    callbacks.add(callback)
    this.callbacks.set(key, callbacks)
    return ()=>{
      this.callbacks.get(key)?.delete(callback)
    }
  }

  delete(key: K<TStore>): boolean {
    this.callbacks.delete(key)
    return super.delete(key)
  }  
}