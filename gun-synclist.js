/**
 * gun-synclist
 * @author  S.J.J. de Vries ( Stefdv2@hotmail.com)
 * @gitter @Stefdv
 * @purpose 
 * - on init it will return your full set as an Array, including a 'lookup' Object.
 * - on every change after initial run it reurns the full changed node, its soul and 
 *   its index in the initial Array. eg: {soul:"AbCd123....", idx: 121, {<your full node>}}
 * - even on nested property changes it will still return the node soul ( not the soul of the nested object);
 * 
 * @why
 * - No need to rebuild the whole list in DOM when one property changes...just use the index to splice the item.
 * 
 * ( i used .open() from Gun/lib/open.js as a base, tx those developers.)
 */

;(function(){
  if(typeof window !== "undefined"){
    var Gun = window.Gun;
  } else {
    var Gun = require('gun/gun');
  }

  Gun.chain.synclist = function(cb, opt, at){
    opt = opt || {};
    opt.doc = opt.doc || {};                // used to build the full set
    opt.ids = opt.ids || {};                // keep track of processed ids
    opt.init = opt.init || true;            // if we have opt.init...init is finished ;p
    opt.any = opt.any || cb;                // users callback function
    opt.list = opt.list || [];              // Array build from opt.doc
    opt.lookup = opt.lookup || {};          // lookup soul/index in opt.list
    opt.owner = opt.owner || null;          // soul of the node the change happened on
    opt.ev = opt.ev || {off: function(){
      Gun.obj.map(opt.ev.s, function(e){
        if(e){ e.off() }
      });
      opt.ev.s = {};
    }, s:{}}
    this.on(function(data, key, ctx,ev){
      delete ((data = Gun.obj.copy(data))||{})._;
        if(this.back(1)._.get) {
          opt.root = this.back(1)._.get;
          opt.prop = this._.get  ;
          if(opt.doc[opt.root]){ opt.owner = opt.root; }
          else if(opt.doc[opt.prop]) { opt.owner = opt.prop; } 
        } 

        clearTimeout(opt.to);
          opt.to = setTimeout(function(){
            if(!opt.any){ return };
            if(opt.init) {
              let list =Object.keys(opt.doc).map( (soul,idx) => {
                  opt.lookup[soul] = idx;
                  if(opt.doc[soul]) {
                    opt.doc[soul]._soul = soul;
                  }
                  return opt.doc[soul]
              });
              let lookup = Gun.obj.copy(opt.lookup)
              opt.any.call(opt.at.gun,{list:list,lookup:lookup});
              if(opt.off){
                opt.ev.off();
                opt.any = null;
              }
            } else {
              opt.any.call(opt.at.gun,{soul:opt.owner,
                                      idx:opt.lookup[opt.owner],
                                      node:opt.doc[opt.owner]}
                          );
            } 
            opt.init = false;
            
          }, opt.wait || 1);
      
          opt.at = opt.at || ctx;
          opt.key = opt.key || key;
          opt.ev.s[this._.id] = ev;
          var tmp = this, id,idx;
          Gun.obj.map(data, function(val, key){
            id = Gun.val.rel.is(val);
            if(!id) { 
              (at || opt.doc)[key] = val;
              return;
            } 
            if(opt.ids[id]){
              (at || opt.doc)[key] = opt.ids[id];
              return;
            }
            opt.ids[id] = ( at || opt.doc )[key] = {};
            tmp.get(key).synclist(opt.any, opt, opt.ids[id]);
          });
        },true)
      };
      
      Gun.chain.listonce = function(cb, opt, at){
        (opt = opt || {}).off = !0;
        return this.synclist(cb, opt, at);
      }
      
    }());
