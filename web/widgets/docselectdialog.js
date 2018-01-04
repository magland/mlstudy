function DocSelectDialog(O) {
	O=O||this;
	JSQWidget(O);
	O.div().addClass('DocSelectDialog');

	this.setDocStorClient=function(DSC) {m_docstor_client=DSC;};
	this.setOptions=function(opts) {m_options=JSQ.clone(opts);};
	this.onSelected=function(callback) {onSelected(callback);};
	this.show=function() {show();};
	this.selection=function() {return m_selection;};

	var m_docstor_client=null;
	var m_options={};
	var m_dialog=$('<div id="dialog"></div>');
	var m_label='Select document';
	var m_selection={};

	O.div().append('<h3>Select a document:</h3>');
	var ul=$('<ul />');
	O.div().append(ul);

	function show() {
		O.setSize(450,450);

		var W=O.width();
		var H=O.height();
		m_dialog.css('overflow','hidden');
		m_dialog.append(O.div());
		$('body').append(m_dialog);
		m_dialog.dialog({width:W+20,
		              height:H+60,
		              resizable:false,
		              modal:true,
		              title:m_label});

		load_documents(function(docs) {
			var ul=O.div().find('ul');
			ul.empty();
			for (var i in docs) {
				var doc=docs[i];
				var li=create_li_for_doc(doc);
				ul.append(li);
			}
		});
	}

	function load_documents(callback) {
		if (m_options.source=='docstor') {
			if (!m_docstor_client) {
				alert('docstor client not set in DocSelectDialog');
				return;
			}
			var obj={
				owned_by:m_options.owner,
				filter:m_options.filter
			};
			if ((m_options.user)&&(m_options.user!=m_options.owner))
				obj.and_shared_with=m_options.user;
			m_docstor_client.findDocuments(obj,function(err,docs) {
				if (err) {
					alert('Error loading documents from cloud: '+err);
					return;
				}
				var docs0=[];
				for (var i in docs) {
					var doc0=docs[i];
					var doc1={
						owner:m_options.owner,
						title:(doc0.attributes||{}).title||''
					};
					docs0.push(doc1);
				}
				callback(docs0);
			});
		}
		else if (m_options.source=='browser_storage') {
			var docs0=[];
			var LS=new LocalStorage();
			var names=LS.allNames();
			for (var i in names) {
				var name0=names[i];
				if (jsu_starts_with(name0,'mlstudy--')) {
					console.log(name0);
					docs0.push({title:name0.slice(('mlstudy--').length)});
				}
			}
			callback(docs0);
		}
		else {
			alert('Unexpected source in DocSelectDialog: '+m_options.source);
		}
	}

	function create_li_for_doc(doc) {
		var li=$('<li />');
		var str=doc.title;
		if (doc.owner) str+=' ('+doc.owner+')';
		var aa=$('<a href=#>'+str+'</a>');
		li.append(aa);
		aa.click(function() {
			m_selection=JSQ.clone(doc);
			O.emit('selected');
			m_dialog.dialog('close');
		});
		return li;
	}

	function onSelected(callback) {
		JSQ.connect(O,'selected',0,function(evt,args) {
			setTimeout(function() {
				callback(args);
			});
		});
	}
}
