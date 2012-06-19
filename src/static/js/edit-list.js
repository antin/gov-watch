// Generated by IcedCoffeeScript 1.2.0s
(function() {
  var iced, __iced_k_noop,
    __slice = [].slice;

  iced = {
    Deferrals: (function() {

      function _Class(_arg) {
        this.continuation = _arg;
        this.count = 1;
        this.ret = null;
      }

      _Class.prototype._fulfill = function() {
        if (!--this.count) return this.continuation(this.ret);
      };

      _Class.prototype.defer = function(defer_params) {
        var _this = this;
        ++this.count;
        return function() {
          var inner_params, _ref;
          inner_params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          if (defer_params != null) {
            if ((_ref = defer_params.assign_fn) != null) {
              _ref.apply(null, inner_params);
            }
          }
          return _this._fulfill();
        };
      };

      return _Class;

    })(),
    findDeferral: function() {
      return null;
    }
  };
  __iced_k_noop = function() {};

  $(function() {
    var data, item, ___iced_passed_deferral, __iced_deferrals, __iced_k,
      _this = this;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(__iced_k) {
      __iced_deferrals = new iced.Deferrals(__iced_k, {
        parent: ___iced_passed_deferral,
        filename: "edit-list.iced"
      });
      $.getJSON("/api", (__iced_deferrals.defer({
        assign_fn: (function() {
          return function() {
            return data = arguments[0];
          };
        })(),
        lineno: 1
      })));
      __iced_deferrals._fulfill();
    })(function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
        _results.push($("#list").append("<div class='row'>                                         <div class='span7' style='color:white;'>" + item['base']['subject'] + "</div>                                         <a href='/edit#" + item.slug + "' class='span2 btn btn-small btn-primary'>עריכת נתוני בסיס</a>                                         <a href='/udpate#" + item.slug + "' class='span1 btn btn-small btn-primary'>עדכון סטטוס</a>                                   </div>"));
      }
      return _results;
    });
  });

}).call(this);
