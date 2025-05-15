type K<T> = Extract<keyof T, string>
type V<T> = T[Extract<keyof T, string>]

export class Store<TStore extends Object> extends Map<K<TStore>, V<TStore>> {
  private callbacks;
  
  private onCallbacks(key: K<TStore>, value: V<TStore>){
    if(this.callbacks && this.callbacks.has(key))
    this.callbacks.get(key)?.forEach(callback => callback(value))
  }

  constructor(initialValues: TStore) {
    for (const key of Object.keys(initialValues)) {
      if (key === '__proto__' || key === 'constructor') {
        throw new Error(`Invalid key "${key}"`)
      }
    }
    super()
    this.callbacks = new Map<K<TStore>, Set<(prev: V<TStore>)=> unknown>>()
    
    for (const [key, value] of Object.entries(initialValues) as [K<TStore>, V<TStore>][]) {
      this.set(key, value)
    }    
  }

  get<Key extends K<TStore>>(key: Key): TStore[Key] {
    return super.get(key) as TStore[Key];
  }

  set<Key extends K<TStore>>(key: Key, value: TStore[Key]) {
    const prev = this.get(key)
    if(prev === value) return this
    
    super.set(key, value)
    this.onCallbacks(key, value)
    return this
  }

  update<Key extends K<TStore>>(key: Key, value: (prev: TStore[Key]) => TStore[Key]) {
    if(!this.has(key)) throw Error(`Calling update: "${key}" was not initialized.`)
    const prev = this.get(key) as TStore[Key]
    const _newVal = value(prev)
    if(prev === _newVal) return this

    super.set(key, _newVal)
    this.onCallbacks(key, _newVal)
    return this
  }

  subscribe<Key extends K<TStore>>(key: Key, callback: (prev: TStore[Key]) => unknown) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function')
    }
    const callbacks = this.callbacks.get(key) ?? new Set()
    callbacks.add(callback as (prev: V<TStore>) => unknown)
    this.callbacks.set(key, callbacks)
    return ()=>{
      this.callbacks.get(key)?.delete(callback as (prev: V<TStore>) => unknown)
    }
  }

  unsubscribeAll(key: K<TStore>) {
    this.callbacks.delete(key)
  }  
}