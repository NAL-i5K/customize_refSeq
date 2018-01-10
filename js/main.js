define([
           'dojo/_base/declare',
           'JBrowse/Plugin'
       ],
       function(
           declare,
           JBrowsePlugin
       ) {
return declare( JBrowsePlugin,
{
    constructor: function( args ) {
        var browser = args.browser;
        console.log( "NAL_refSeq_description plugin starting" );
        browser.afterMilestone('loadConfig'), function(deffered) {
            browser.config.refSeqNameTransformer = refSeqNameTransformer;
        }
        browser.afterMilestone('initPlugins'), function(deffered) {
            browser.createNavBox = createNavBox;
        }
    },
    refSeqNameTransformer: function(refseq){
        return refseq.name + " " + refseq.description;
    },
    createNavBox: function(parent) {
        var thisB = this;
        var align = 'center';
        var navbox = dojo.create( 'div', { id: 'navbox', style: { 'text-align': align } }, parent );
    
        // container adds a white backdrop to the locationTrap.
        var locationTrapContainer = dojo.create('div', {className: 'locationTrapContainer'}, navbox );
    
        this.locationTrap = dojo.create('div', {className: 'locationTrap'}, locationTrapContainer );
    
        var four_nbsp = String.fromCharCode(160); four_nbsp = four_nbsp + four_nbsp + four_nbsp + four_nbsp;
        navbox.appendChild(document.createTextNode( four_nbsp ));
    
        var moveLeft = document.createElement("img");
        //moveLeft.type = "image";
        moveLeft.src = this.resolveUrl( "img/Empty.png" );
        moveLeft.id = "moveLeft";
        moveLeft.className = "icon nav";
        navbox.appendChild(moveLeft);
        dojo.connect( moveLeft, "click", this,
                      function(event) {
                          dojo.stopEvent(event);
                          this.view.slide(0.9);
                      });
    
        var moveRight = document.createElement("img");
        //moveRight.type = "image";
        moveRight.src = this.resolveUrl( "img/Empty.png" );
        moveRight.id="moveRight";
        moveRight.className = "icon nav";
        navbox.appendChild(moveRight);
        dojo.connect( moveRight, "click", this,
                      function(event) {
                          dojo.stopEvent(event);
                          this.view.slide(-0.9);
                      });
    
        navbox.appendChild(document.createTextNode( four_nbsp ));
    
        var bigZoomOut = document.createElement("img");
        //bigZoomOut.type = "image";
        bigZoomOut.src = this.resolveUrl( "img/Empty.png" );
        bigZoomOut.id = "bigZoomOut";
        bigZoomOut.className = "icon nav";
        navbox.appendChild(bigZoomOut);
        dojo.connect( bigZoomOut, "click", this,
                      function(event) {
                          dojo.stopEvent(event);
                          this.view.zoomOut(undefined, undefined, 2);
                      });
    
    
        var zoomOut = document.createElement("img");
        //zoomOut.type = "image";
        zoomOut.src = this.resolveUrl("img/Empty.png");
        zoomOut.id = "zoomOut";
        zoomOut.className = "icon nav";
        navbox.appendChild(zoomOut);
        dojo.connect( zoomOut, "click", this,
                      function(event) {
                          dojo.stopEvent(event);
                         this.view.zoomOut();
                      });
    
        var zoomIn = document.createElement("img");
        //zoomIn.type = "image";
        zoomIn.src = this.resolveUrl( "img/Empty.png" );
        zoomIn.id = "zoomIn";
        zoomIn.className = "icon nav";
        navbox.appendChild(zoomIn);
        dojo.connect( zoomIn, "click", this,
                      function(event) {
                          dojo.stopEvent(event);
                          this.view.zoomIn();
                      });
    
        var bigZoomIn = document.createElement("img");
        //bigZoomIn.type = "image";
        bigZoomIn.src = this.resolveUrl( "img/Empty.png" );
        bigZoomIn.id = "bigZoomIn";
        bigZoomIn.className = "icon nav";
        navbox.appendChild(bigZoomIn);
        dojo.connect( bigZoomIn, "click", this,
                      function(event) {
                          dojo.stopEvent(event);
                          this.view.zoomIn(undefined, undefined, 2);
                      });
    
        navbox.appendChild(document.createTextNode( four_nbsp ));
    
        // default search box is location box
        var locationMode = "";
        var locationWidth = '40ex';
        if (this.config.locationBox==="separate") { // separate location box
            locationMode = "separate-location-box"
            locationWidth = '25ex';
        }
    
        var searchbox = dojo.create('span', {
            'id':'search-box',
            'class': locationMode
        }, navbox );
    
        // if we have fewer than 30 ref seqs, or `refSeqDropdown: true` is
        // set in the config, then put in a dropdown box for selecting
        // reference sequences
        var refSeqSelectBoxPlaceHolder = dojo.create('span', {id:'search-refseq'}, searchbox );
    
        // make the location search box
        this.locationBox = new dijitComboBox(
            {
                id: "location",
                name: "location",
                style: { width: locationWidth },
                maxLength: 400,
                searchAttr: "name",
                title: 'Enter a chromosomal position, symbol or ID to search'
            },
            dojo.create('input', {}, searchbox) );
            this.afterMilestone( 'loadNames', dojo.hitch(this, function() {
            if( this.nameStore ) {
                this.locationBox.set( 'store', this.nameStore );
            }
        }));
    
        this.locationBox.focusNode.spellcheck = false;
        dojo.query('div.dijitArrowButton', this.locationBox.domNode ).orphan();
        dojo.connect( this.locationBox.focusNode, "keydown", this, function(event) {
                          if( event.keyCode == keys.ESCAPE ) {
                              this.locationBox.set('value','');
                          }
                          else if (event.keyCode == keys.ENTER) {
                              this.locationBox.closeDropDown(false);
                              this.navigateTo( this.locationBox.get('value') );
                              this.goButton.set('disabled',true);
                              dojo.stopEvent(event);
                          } else {
                              this.goButton.set('disabled', false);
                          }
                      });
        dojo.connect( navbox, 'onselectstart', function(evt) { evt.stopPropagation(); return true; });
        // monkey-patch the combobox code to make a few modifications
        (function(){
    
             // add a moreMatches class to our hacked-in "more options" option
             var dropDownProto = eval(this.locationBox.dropDownClass).prototype;
             var oldCreateOption = dropDownProto._createOption;
             dropDownProto._createOption = function( item ) {
                 var option = oldCreateOption.apply( this, arguments );
                 if( item.hitLimit )
                     dojo.addClass( option, 'moreMatches');
                 return option;
             };
    
             // prevent the "more matches" option from being clicked
             var oldOnClick = dropDownProto.onClick;
             dropDownProto.onClick = function( node ) {
                 if( dojo.hasClass(node, 'moreMatches' ) )
                     return null;
                 return oldOnClick.apply( this, arguments );
             };
        }).call(this);
    
        // make the 'Go' button
        this.goButton = new dijitButton(
        {
            label: 'Go',
            onClick: dojo.hitch( this, function(event) {
                this.navigateTo(this.locationBox.get('value'));
                this.goButton.set('disabled',true);
                dojo.stopEvent(event);
            }),
            id: 'search-go-btn'
        }, dojo.create('button',{},searchbox));
    
        this.highlightButtonPreviousState = false;
    
        // create location box
        // if in config "locationBox": "separate", then the search box will be the location box.
        if (this.config.locationBox==="separate") {
            this.locationInfoBox = domConstruct.place("<div id='location-info'>location</div>", navbox);
        }
    
        // make the highligher button
        this.highlightButton = new dojoxTriStateCheckBox({
            //label: 'Highlight',
            title: 'Highlight a Region',
            id: 'highlight-btn',
            states:[false, true, "mixed"],
            onChange: function() {
                if( this.get('checked')==true ) {
                    thisB.view._rubberStop();
                    thisB.view.behaviorManager.swapBehaviors('normalMouse','highlightingMouse');
                } else if( this.get('checked')==false) {
                    var h = thisB.getHighlight();
                    if( h ) {
                        thisB.clearHighlight();
                        thisB.view.redrawRegion( h );
                    }
                }
                else { // mixed
                    // Uncheck since user is cycling three-state instead
                    // of programmatically landing in mixed state
                    if( thisB.highlightButtonPreviousState != true ) {
                        thisB.highlightButton.set('checked', false);
                    }
                    else {
                        thisB.highlightButtonPreviousState = false;
                    }
                    thisB.view._rubberStop();
                    thisB.view.behaviorManager.swapBehaviors('highlightingMouse','normalMouse');
                }
            }
        }, dojo.create('button',{id: 'highlight-btn'},navbox));
    
        this.subscribe('/jbrowse/v1/n/globalHighlightChanged',
                       function() { thisB.highlightButton.set('checked',false); });
    
        this.afterMilestone('loadRefSeqs', dojo.hitch( this, function() {
    
            // make the refseq selection dropdown
            if( this.refSeqOrder && this.refSeqOrder.length ) {
                var max = this.config.refSeqSelectorMaxSize || 30;
                var numrefs = Math.min( max, this.refSeqOrder.length);
                var options = [];
                for ( var i = 0; i < numrefs; i++ ) {
                    options.push( { value: this.refSeqOrder[i], label: this.config.refSeqNameTransformer?this.config.refSeqNameTransformer(this.allRefs[this.refSeqOrder[i]]):this.refSeqOrder[i] } );
                }
                var tooManyMessage = '(first '+numrefs+' ref seqs)';
                if( this.refSeqOrder.length > max ) {
                    options.push( { label: tooManyMessage , value: tooManyMessage, disabled: true } );
                }
                this.refSeqSelectBox = new dijitSelectBox({
                    name: 'refseq',
                    value: this.refSeq ? this.refSeq.name : null,
                    options: options,
                    onChange: dojo.hitch(this, function( newRefName ) {
                        // don't trigger nav if it's the too-many message
                        if( newRefName == tooManyMessage ) {
                            this.refSeqSelectBox.set('value', this.refSeq.name );
                            return;
                        }
    
                        // only trigger navigation if actually switching sequences
                        if( newRefName != this.refSeq.name ) {
                            this.navigateToLocation({ ref: newRefName });
                        }
                    })
                }).placeAt( refSeqSelectBoxPlaceHolder );
            }
    
            // calculate how big to make the location box:  make it big enough to hold the
            var locLength = this.config.locationBoxLength || function() {
    
                // if we have no refseqs, just use 20 chars
                if( ! this.refSeqOrder.length )
                    return 20;
    
                // if there are not tons of refseqs, pick the longest-named
                // one.  otherwise just pick the last one
                var ref = this.refSeqOrder.length < 1000
                    && function() {
                           var longestNamedRef;
                           array.forEach( this.refSeqOrder, function(name) {
                                              var ref = this.allRefs[name];
                                              if( ! ref.length )
                                                  ref.length = ref.end - ref.start + 1;
                                              if( ! longestNamedRef || longestNamedRef.length < ref.length )
                                                  longestNamedRef = ref;
                                          }, this );
                           return longestNamedRef;
                       }.call(this)
                    || this.refSeqOrder.length && this.allRefs[ this.refSeqOrder[ this.refSeqOrder.length - 1 ] ]
                    || 20;
    
                var locstring = Util.assembleLocStringWithLength({ ref: ref.name, start: ref.end-1, end: ref.end, length: ref.length });
                //console.log( locstring, locstring.length );
                return locstring.length;
            }.call(this) || 20;
    
    
            this.locationBox.domNode.style.width = locLength+'ex';
        }));
    
        return navbox;
    }
});
});
