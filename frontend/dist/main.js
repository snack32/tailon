function formatBytes(size){for(var i=0;1024<=size;)size/=1024,++i;return size.toFixed(1)+" "+["B","KB","MB","GB","TB","PB","EB","ZB","YB"][i]}function formatFilename(state){if(!state.id)return state.text;var size=formatBytes($(state.element).data("size"));return"<span>"+state.text+'</span><span style="float:right;">'+size+"</span>"}function endsWith(str,suffix){return-1!==str.indexOf(suffix,str.length-suffix.length)}function startsWith(str,prefix){return 0===str.indexOf(prefix)}var escape_entity_map={"&":"&amp;","<":"&lt;",">":"&gt;","/":"&#x2F;"};function escapeHtml(str){return String(str).replace(/[&<>\/]/g,function(s){return escape_entity_map[s]})}function parseQueryString(str){var res={};return str.substr(1).split("&").forEach(function(item){var el=item.split("="),key=el[0],value=el[1]&&decodeURIComponent(el[1]);key in res?res[key].push(value):res[key]=[value]}),res}Vue.component("logview",{template:'<div class="log-view"></div>',props:["linesOfHistory"],data:function(){return{history:[],lastSpan:null,lastSpanClasses:"",autoScroll:!0}},watch:{linesOfHistory:function(val){this.trimHistory()}},methods:{clearLines:function(){this.$el.innerHTML="",this.history=[],this.lastSpan=null},toggleWrapLines:function(val){this.$el.classList.toggle("log-view-wrapped",val)},createSpan:function(innerHtml,classNames){var span=document.createElement("span");return span.innerHTML=innerHtml,span.className=classNames,span},createLogEntrySpan:function(innerHtml){return this.createSpan(innerHtml,"log-entry")},createNoticePan:function(innerHtml){return createSpan(innerHtml,"log-entry log-notice")},trimHistory:function(){if(0!==this.linesOfHistory&&this.history.length>this.linesOfHistory)for(var i=0;i<this.history.length-this.linesOfHistory+1;i++)this.$el.removeChild(this.history.shift())},isScrolledToBottom:function(){var elParent=this.$el.parentElement,autoScrollOffset=elParent.scrollTop-(elParent.scrollHeight-elParent.offsetHeight);return Math.abs(autoScrollOffset)<50},scroll:function(){this.$el.parentElement.scrollTop=this.$el.parentElement.scrollHeight},write:function(source,line){var span;"o"===source&&(line=escapeHtml(line).replace(/\n$/,""),span=this.createLogEntrySpan(line),this.writeSpans([span]))},writeSpans:function(spanArray){if(0!==spanArray.length){for(var scrollAfterWrite=this.isScrolledToBottom(),fragment=document.createDocumentFragment(),i=0;i<spanArray.length;i++){var span=spanArray[i];this.history.push(span),fragment.appendChild(span)}this.lastSpan&&(this.lastSpan.className=this.lastSpanClasses),this.$el.appendChild(fragment),this.trimHistory(),this.autoScroll&&scrollAfterWrite&&this.scroll(),this.lastSpan=this.history[this.history.length-1],this.lastSpanClasses=this.lastSpan.className,this.lastSpan.className=this.lastSpanClasses+" log-entry-current"}}}}),Vue.component("multiselect",window.VueMultiselect.default),Vue.component("vue-loading",window.VueLoading);var apiURL=endsWith(window.relativeRoot,"/")?"ws":"/ws",app=(apiURL=[window.location.protocol,"//",window.location.host,window.relativeRoot,apiURL].join(""),new Vue({el:"#app",delimiters:["<%","%>"],data:{relativeRoot:relativeRoot,commandScripts:commandScripts,fileList:[],allowCommandNames:allowCommandNames,allowDownload:allowDownload,file:null,command:null,script:null,linesOfHistory:5000,linesToTail:1000,wrapLines:false,hideToolbar:!1,showConfig:!1,showLoadingOverlay:!1,socket:null,isConnected:!1},created:function(){this.backendConnect(),this.command=this.allowCommandNames[0]},computed:{scriptInputEnabled:function(){return""!==this.commandScripts[this.command]},downloadLink:function(){return this.file?relativeRoot+"files/?path="+this.file.path:"#"}},methods:{clearLogview:function(){this.$refs.logview.clearLines()},backendConnect:function(){this.showLoadingOverlay=!0,this.socket=new SockJS(apiURL),this.socket.onopen=this.onBackendOpen,this.socket.onclose=this.onBackendClose,this.socket.onmessage=this.onBackendMessage},onBackendOpen:function(){this.isConnected=!0,this.refreshFiles()},onBackendClose:function(){this.isConnected=!1,backendConnect=this.backendConnect,window.setTimeout(function(){backendConnect()},1e3)},onBackendMessage:function(message){var data=JSON.parse(message.data);if(data.constructor===Object){var fileList=[];Object.keys(data).forEach(function(key){var group="__default__"===key?"Ungrouped Files":key;fileList.push({group:group,files:data[key]})}),this.fileList=fileList,this.file||(this.file=fileList[0].files[0])}else{var stream=data[0],line=data[1];this.$refs.logview.write(stream,line)}},refreshFiles:function(){this.socket.send("list")},notifyBackend:function(){var msg={command:this.command,script:this.script,entry:this.file,nlines:this.linesToTail};this.clearLogview(),this.socket.send(JSON.stringify(msg))}},watch:{isConnected:function(val){this.showLoadingOverlay=!val},wrapLines:function(val){this.$refs.logview.toggleWrapLines(val)},command:function(val){val&&this.isConnected&&(this.script=this.commandScripts[val],this.notifyBackend())},file:function(val){val&&this.isConnected&&this.notifyBackend()}}}));
