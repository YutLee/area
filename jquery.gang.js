/**
 * gang -- 多级联动
 * 
 * author yutlee.cn@gmail.com
 */
 
(function($, window, undefined) {
	var Gang = function(element, options) {
		this.init(element, options);
		element.data(this.options.name, this);
	};
	
	Gang.prototype = {
		init: function(element, options) {
			var that = this;
			
			options = that.options = $.extend({}, that.options, options);
			that.element = element;
			
			if(!options.dataSource) { 
				return false;
			}
			
			that.create();
			
			that.element.bind('click', function(e) {
				that.toggle();
				return false;
			});
			
			that.popup.bind('click', function(e) {
				return false;
			});
			
			that.tabs.delegate('.item', 'click', function(e) {
				var t = $(this);
				t.addClass('chose').siblings().removeClass('chose');
				that.contents.children().eq(t.index()).addClass('chose').siblings().removeClass('chose');
			});
			
			that.contents.delegate('a', 'click', function(e) {
				var t = $(this),
					idx = t.parent().index(),
					data = t.data('list'),
					text = t.text(),
					value = t.attr('val'),
					isList = $.type(data['l']) === 'object' && !$.isEmptyObject(data['l']);
					
				t.addClass('chose').siblings().removeClass('chose');
				
				that.idx = idx;
				that.tabs.children().eq(idx).children('span').text(text);
				that.inputList[idx].attr('value', value);
				that.newTexts.pop();
				that.newValues.pop();
				that.removeNextAll(idx);
				if(isList) {
					that.newTexts.push(text, '--请选择--');
					that.newValues.push(value, '--请选择--');
					that.setNext(data, value);
				}else {
					that.close();
					that.values = [];
					that.texts = [];
					that.newTexts.push(text);
					that.newValues.push(value);
					for(var i = 0; i < that.newValues.length; i++) {
						that.values.push(that.newValues[i]);
						that.texts.push(that.newTexts[i]);
					}
					if($.isFunction(options.lastSelect)) {
						options.lastSelect.call(that);
					}
					that.span.text(that.newTexts.join(' '));
				}
				
				//that.contents.children().eq(t.index()).show().siblings().hide();
			});
			
			$(document).bind('click', function(e) {
				var idx = that.idx,
					len = that.values.length;
				that.close();
				if(idx !== 'undefined' && idx < len) {
					for(var i = idx; i < len; i++) {
						var value = that.values[i],
							item = that.contents.children().eq(i).find('a[val=' + value + ']');//.data('list');
						item.click();
					}
				}else {
					that.tabs.children().last().click();
				}
			});
			
		},
		options: {
			name: 'gGang',
			isSetCookie: true,
			//cookieName: '',
			defOption: [11, 1101, 110103],
			//series: []
		},
		toggle: function() {
			var that = this;
			that.popup.css('display') === 'none' ? that.open() : that.close();
		},
		close: function() {
			var that = this;
			that.element.removeClass('chose');
			that.popup.hide();
		},
		open: function() {
			var that = this,
				el = that.element,
				offset = {
					top: el.offset().top + el.height(),
					left:el.offset().left
				};
			el.addClass('chose');
			that.popup.css(offset).show();
		},
		getCookie: function(name) { 
			//获取cookie字符串 
			var strCookie=document.cookie; 
			//将多cookie切割为多个名/值对 
			var arrCookie=strCookie.split("; "); 
			var value;
			//遍历cookie数组，处理每个cookie对 
			for(var i=0;i<arrCookie.length;i++){ 
				var arr=arrCookie[i].split("="); 
				//找到名称为userId的cookie，并返回它的值 
				if(name == arr[0]){ 
					value = arr[1]; 
					break; 
				}
			}
			return value || false;
		},
		setCookie: function(name, value, time) {
			//获取当前时间 
			var date=new Date(); 
			//将date设置为过去的时间 
			date.setTime(date.getTime() - 10000); 
			//将userId这个cookie删除 
			document.cookie= name + '=' + this.getCookie(name) + '; expires=' + date.toGMTString(); 
			var str = escape(name) + '=' + escape(value);
			if(time > 0){//为0时不设定过期时间，浏览器关闭时cookie自动消失
				var date = new Date();
				var ms = time * 3600 * 1000;
				date.setTime(date.getTime() + ms);
				str += "; expires=" + date.toGMTString();
			}
			document.cookie = str;
		},
		create: function() {
			var that = this,
				el = that.element,
				options = that.options,
				cookieName = options.cookieName,
				value = that.getCookie(cookieName);//.split('-');//[11, 1101, 110103];

			value = value ? value.split('-') : options.defOption;
			
			that.span = $('<span>').appendTo(el);
			el.append('<em></em>');
			that.popup = $('<div class="popup">').addClass(options.className || '').appendTo(document.body);
			that.tabs = $('<div class="tabs">').appendTo(that.popup);
			that.contents = $('<div class="contents">').appendTo(that.popup);
			
			that.dataBand(options.dataSource, value, true);
			
		},
		setList: function(data, value, idx) {
			var that = this,
				len = that.contentsList.length;
			that.contentsList.push($('<div class="list"></div>').appendTo(that.contents));
			$.each(data, function(n, l) {
				var one = $('<a href="javascript:void(0);" val="' + n + '">' + l['n'] + '</a>').data('list', l).appendTo(that.contentsList[len]);
				if(n == value) {
					that.newValues.push(n);
					that.newTexts.push(l['n']);
					that.values.push(n);
					that.texts.push(l['n']);
					that.inputList.push($('<input type="hidden" name="' + (that.options.series[idx] || "") + '" value="' + n + '" />').appendTo(that.element));
					one.addClass('chose');
				}
			});
		},
		removeNextAll: function(idx) {
			var that = this,
				len = that.size;
			for(var i = len - 1; i > idx; i--) {
				that.tabsList.pop();
				that.contentsList.pop();
				that.inputList.pop();
				that.newTexts.pop();
				that.newValues.pop();
				that.tabs.children().eq(i).remove();
				that.contents.children().eq(i).remove();
				that.element.children('input').eq(i).remove();
			}
			that.size = idx + 1;
		},
		setNext: function(data, value) {
			var that = this,
				now = data['l'],
				len = that.size;
				
			that.tabsList.push($('<div class="item"><span>' + '--请选择--' + '</span><em></em></div>').appendTo(that.tabs));
			that.contentsList.push($('<div class="list"></div>').appendTo(that.contents));
			that.inputList.push($('<input type="hidden" name="" value="" />').appendTo(that.element));
			$.each(now, function(n, l) {
				$('<a href="javascript:void(0);" val="' + n + '">' + l['n'] + '</a>').data('list', l).appendTo(that.contentsList[len]);
			});
			that.tabs.children().last().click();
			that.size++;
		},
		dataBand: function(data, values, first) {
			var that = this,
				i = 0,
				len = values.length,
				values,
				texts;
				
			that.size = len;
				
			that.tabsList = [];
			that.contentsList = [];
			that.inputList = [];
			that.newTexts = [];
			that.newValues = [];
			that.texts = [];
			that.values = [];
				
			function isList(data) {
				return ($.type(data) === 'object' && !$.isEmptyObject(data));
			}
			
			function getNext(data) {
				if(isList(data)) {
					return data;
				}
			}
				
			for(; i < len; i++) {
				var list,
					now = values[i];
				
				if(i === 0 && first) {
					that.setList(data, now, i);
					data = data[now];
				}else {
					data = getNext(data['l'][now]);
				}
				that.tabsList.push($('<div class="item"><span>' + data['n'] + '</span><em></em></div>').appendTo(that.tabs));
				list = data['l'];
				if(list) {
					that.setList(list, values[i + 1], i);
				}
				if(i === len - 1) {
					that.tabsList[len - 1].addClass('chose');
					that.contentsList[len - 1].addClass('chose');
				}
			}

			that.span.text(that.newTexts.join(' '));
		}
	};
	
	$.fn.gang = function(options) {
		this.each(function(idx) {
			new Gang($(this), options);
		});
		return this;
	};
})(jQuery, window);