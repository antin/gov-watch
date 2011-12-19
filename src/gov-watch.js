(function() {
  var all_books, all_chapters, data_callback, do_search, gs_data_callback, h_data_callback, loaded_data, onhashchange, process_data, selected_book, selected_chapter, show_watermark, update_history, version_callback, wm_shown;
  loaded_data = null;
  all_books = [];
  all_chapters = {};
  selected_book = "";
  selected_chapter = "";
  update_history = function() {
    var hash;
    hash = "" + selected_book + "//" + selected_chapter;
    return window.location.hash = hash;
  };
  onhashchange = function() {
    var chapter, hash, splits, _i, _len, _ref;
    hash = window.location.hash;
    hash = hash.slice(1, hash.length);
    splits = hash.split('//');
    if (splits.length === 2) {
      selected_book = splits[0], selected_chapter = splits[1];
      $("#books option[value='" + selected_book + "']").attr('selected', 'selected');
      if (all_chapters[selected_book]) {
        $("#chapters").html("<option value=''>כל הפרקים</option>");
        _ref = all_chapters[selected_book];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          chapter = _ref[_i];
          $("#chapters").append("<option value='" + chapter + "'>" + chapter + "</option>");
        }
      } else {
        $("#chapters").html("<option value=''>-</option>");
      }
      $("#chapters option[value='" + selected_chapter + "']").attr('selected', 'selected');
      return do_search();
    } else {
      selected_book = "";
      selected_chapter = "";
      return update_history();
    }
  };
  wm_shown = false;
  show_watermark = function(show) {
    if (show) {
      $("#searchbox").val("חיפוש חופשי בתוך ההמלצות");
    } else {
      if (wm_shown) {
        $("#searchbox").val("");
      }
    }
    wm_shown = show;
    return $("#searchbox").toggleClass('watermark', show);
  };
  gs_data_callback = function(data) {
    var cell, col, contents, entries, entry, field, field_titles, idx, row, _i, _len;
    entries = data.feed.entry;
    field_titles = {};
    loaded_data = [];
    for (_i = 0, _len = entries.length; _i < _len; _i++) {
      entry = entries[_i];
      cell = entry.gs$cell;
      row = parseInt(cell.row);
      col = parseInt(cell.col);
      contents = cell.$t;
      if (!contents) {
        contents = "";
      }
      if (row === 1) {
        field_titles[col] = contents;
      } else {
        idx = row - 2;
        field = field_titles[col];
        if (col === 1) {
          loaded_data[idx] = {
            '_srcslug': "" + row
          };
        }
        loaded_data[idx][field] = contents;
      }
    }
    return data_callback(loaded_data);
  };
  window.gs_data_callback = gs_data_callback;
  h_data_callback = function(data) {
    var get_slug;
    get_slug = function(x) {
      return parseInt(x._src.split('/')[3]);
    };
    data = data.sort(function(a, b) {
      return get_slug(a) - get_slug(b);
    });
    loaded_data = data;
    return data_callback(loaded_data);
  };
  data_callback = function(data) {
    var book, chapters, rec, _i, _len;
    all_books = {};
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      rec = data[_i];
      if (!all_books[rec.book]) {
        all_books[rec.book] = {};
      }
      all_books[rec.book][rec.chapter] = true;
    }
    all_chapters = {};
    for (book in all_books) {
      chapters = all_books[book];
      all_chapters[book] = Object.keys(chapters);
    }
    all_books = Object.keys(all_books);
    if (localStorage) {
      localStorage.data = JSON.stringify(data);
      localStorage.all_books = JSON.stringify(all_books);
      localStorage.all_chapters = JSON.stringify(all_chapters);
    }
    return process_data();
  };
  process_data = function() {
    var book, html, item_hoveroff, item_hoveron, list_template, template, _i, _len;
    $("#books").html("<option value=''>הכל</option>");
    for (_i = 0, _len = all_books.length; _i < _len; _i++) {
      book = all_books[_i];
      $("#books").append("<option value='" + book + "'>" + book + "</option>");
    }
    template = $("script[name=item]").html();
    list_template = $("script[name=list]").html();
    html = Mustache.to_html(template, {
      items: loaded_data,
      none_val: function() {
        return function(text, render) {
          text = render(text);
          if (text === "") {
            return "אין";
          } else {
            return text;
          }
        };
      },
      semicolon_list: function() {
        return function(text, render) {
          text = render(text);
          text = text.split('; ');
          return text = Mustache.to_html(list_template, {
            "items": text
          });
        };
      }
    });
    $("#items").html(html);
    item_hoveroff = function() {
      return $(this).find(".buxa-footer").html("");
    };
    item_hoveron = function() {
      var disqus_params;
      html = "<div id='disqus_thread' style='height:300px'></div><a href='http://disqus.com' class='dsq-brlink'>blog comments powered by <span class='logo-disqus'>Disqus</span></a>";
      if (!window.DISQUS) {
        html += "<script type='text/javascript' async='true' src='http://govwatch.disqus.com/embed.js'/>";
      }
      window.disqus_identifier = 'recommendation' + $(this).attr('rel');
      window.disqus_title = $(this).attr('title');
      window.disqus_url = "http://gov-watch.org.il/#!" + window.disqus_identifier;
      $(this).find(".buxa-footer").html(html);
      disqus_params = {
        reload: true,
        config: function() {
          this.page.identifier = window.disqus_identifier;
          this.page.title = window.disqus_title;
          return this.page.url = window.disqus_url;
        }
      };
      if (window.DISQUS) {
        return window.DISQUS.reset(disqus_params);
      }
    };
    $(".item").hover(item_hoveron, item_hoveroff);
    show_watermark(true);
    $("#searchbox").change(function() {
      return do_search();
    });
    $("#searchbox").focus(function() {
      return show_watermark(false);
    });
    $("#searchbox").blur(function() {
      if ($(this).val() === "") {
        return show_watermark(true);
      }
    });
    $("#books").change(function() {
      selected_book = $("#books").val();
      selected_chapter = "";
      return update_history();
    });
    $("#chapters").change(function() {
      selected_chapter = $("#chapters").val();
      return update_history();
    });
    window.onhashchange = onhashchange;
    return onhashchange();
  };
  do_search = function() {
    var field, found, new_fields, re, rec, search_term, should_show, slug, _i, _j, _len, _len2, _ref;
    if (wm_shown) {
      search_term = "";
    } else {
      search_term = $("#searchbox").val();
    }
    re = RegExp(search_term, "ig");
    for (_i = 0, _len = loaded_data.length; _i < _len; _i++) {
      rec = loaded_data[_i];
      slug = rec._srcslug;
      should_show = search_term === "";
      new_fields = {};
      _ref = ["recommendation", "subject", "result_metric", "title"];
      for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
        field = _ref[_j];
        if (search_term === "") {
          found = false;
        } else {
          if (rec[field]) {
            found = rec[field].search(search_term) !== -1;
            new_fields[field] = rec[field].replace(search_term, "<span class='highlight'>" + search_term + "</span>");
          } else {
            found = false;
            new_fields[field] = null;
          }
        }
        should_show = should_show || found;
      }
      should_show = should_show && ((selected_book === "") || (rec.book === selected_book)) && ((selected_chapter === "") || (rec.chapter === selected_chapter));
      $(".item[rel=" + slug + "]").toggleClass("shown", should_show);
      $(".item[rel=" + slug + "] .recommendation-text").html(new_fields["recommendation"]);
      $(".item[rel=" + slug + "] .subject").html(new_fields["subject"]);
      $(".item[rel=" + slug + "] .result_metric-text").html(new_fields["result_metric"]);
      $(".item[rel=" + slug + "] .title").html(new_fields["title"]);
    }
    return window.setTimeout(function() {
      return $(".highlight").toggleClass('highlight-off', true);
    }, 10);
  };
  version_callback = function(data) {
    var current_version, _ref;
    if (localStorage) {
      current_version = (_ref = localStorage.version) != null ? _ref : null;
      localStorage.version = data.update_date;
      if (data.update_date !== current_version) {
        return H.findRecords('data/gov/decisions/', data_callback);
      }
    }
  };
  $(function() {
    var json_all_books, json_all_chapters, json_data, json_version;
    json_data = typeof localStorage !== "undefined" && localStorage !== null ? localStorage.data : void 0;
    json_all_books = typeof localStorage !== "undefined" && localStorage !== null ? localStorage.all_books : void 0;
    json_all_chapters = typeof localStorage !== "undefined" && localStorage !== null ? localStorage.all_chapters : void 0;
    json_version = typeof localStorage !== "undefined" && localStorage !== null ? localStorage.version : void 0;
    if (json_data && json_all_books && json_all_chapters && json_version) {
      loaded_data = JSON.parse(json_data);
      all_books = JSON.parse(json_all_books);
      all_chapters = JSON.parse(json_all_chapters);
      process_data();
    }
    $.get("https://spreadsheets.google.com/feeds/cells/0AurnydTPSIgUdE5DN2J5Y1c0UGZYbnZzT2dKOFgzV0E/od6/public/values?alt=json-in-script", gs_data_callback, "jsonp");
    window.disqus_shortname = 'govwatch';
    window.disqus_url = 'gov-watch.org.il';
    return window.disqus_developer = 1;
  });
}).call(this);