/**
 * project.js
 *
 * requirements:
 *	 tools.js
 *	 ui.js
 *	 request.js
 *
 */
 
/**
 */

/**
 * A TrakEM2 Web project.
 *
 * - contains abstract objects on top of a common project-specific semantic framework
 * - is related to one ore more stacks of statically aligned layers
 *   ( all stacks of a project are related by translation using physical dimensions )
 */
function Project( pid )
{
	this.getView = function()
	{
		return view;
	}
	
	/**
	 * add a stack to the project
	 */
	this.addStack = function( stack )
	{
		var opened = false;
		for ( var i = 0; i < stacks.length; ++i )
		{
			if ( stacks[ i ].id == stack.id )
			{
				stack = stacks[ i ];
				opened = true;
				break;
			}
		}
		if ( !opened )
		{
			stacks.push( stack );
			if ( rootWindow.getChild() == null )
				rootWindow.replaceChild( stack.getWindow() );
			else
				rootWindow.replaceChild( new CMWHSplitNode( rootWindow.getChild(), stack.getWindow() ) );
			
			stack.getWindow().focus();	
			ui.onresize();
		}
		if ( stacks.length > 1 )
			self.moveTo( self.coordinates.z, self.coordinates.y, self.coordinates.x );
		else
		{
			var c = stack.projectCoordinates();
			self.moveTo( c.z, c.y, c.x );
			self.setFocusedStack( stack ); // if this is the only stack, focus it.
		}
		
		if ( !tool )
			tool = new Navigator();
		self.setTool( tool );
		
		return;
	}
	
	/**
	 * get one of the projects currently opened stacks
	 */
	this.getStack = function( sid )
	{
		for ( var i = 0; i < stacks.length; ++i )
		{
			if ( stacks[ i ].id == sid ) return stacks[ i ];
		}
		return false;
	}
	
	/**
	 * remove a stack from the list
	 */
	this.removeStack = function( sid )
	{
		for ( var i = 0; i < stacks.length; ++i )
		{
			if ( stacks[ i ].id == sid )
			{
				stacks.splice( i, 1 );
				if ( stacks.length == 0 )
					self.unregister();
				else
					stacks[ ( i + 1 ) % stacks.length ].getWindow().focus();
			}
		}
		ui.onresize();
		return;
	}
	
	/**
	 * focus a stack and blur the rest
	 */
	this.setFocusedStack = function( stack )
	{
		self.focusedStack = stack;
		if ( tool )
			self.focusedStack.setTool( tool );
		return;
	}
	
	/**
	 * focus the next or prior stack
	 */
	this.switchFocus = function( s )
	{
		var i;
		for ( i = 0; i < stacks.length; ++i )
			if ( self.focusedStack == stacks[ i ] ) break;
			
		stacks[ ( i + stacks.length + s ) % stacks.length ].getWindow().focus();
		return;
	}
	
	
	/**
	 * resize the view and its content on window.onresize event
	 */
	var resize = function( e )
	{
		var rootFrame = rootWindow.getFrame();
		var top = document.getElementById( "toolbar_container" ).offsetHeight;
		if ( message_widget.offsetHeight ) top += message_widget.offsetHeight;
		//var bottom = document.getElementById( 'console' ).offsetHeight;
		var bottom = 64;
		var height = Math.max( 0, ui.getFrameHeight() - top - bottom );
		
		rootFrame.style.top = top + "px";
		rootFrame.style.width = UI.getFrameWidth() + "px";
		rootFrame.style.height = height + "px";
		
		rootWindow.redraw();
		
		return true;
	}
	
	/*
	 * Shows the tree view for the loaded project
	 */
	this.showTreeviewWidget = function ( m )
	{
		switch ( m )
		{
		case "entities":
			var tw_status = document.getElementById( 'tree_widget' ).style.display;
			// check if not opened before to prevent messing up with event handlers
			if ( tw_status != 'block' )
			{
				document.getElementById( 'tree_widget' ).style.display = 'block';
				ui.onresize();			
				initTreeview( this.id );
			}
			break;
		}
		return;
	}
	
	/*
	 * Shows the datatable for the loaded project
	 */
	this.showDatatableWidget = function ( m )
	{
		document.getElementById( 'table_widget' ).style.display = 'block';
		ui.onresize();	
		switch ( m )
		{
		case "treenode":
			initDatatable( 'treenode', this.id );
			break;
		case "presynapse":
			initDatatable( 'presynapse', this.id );
			break;
		case "postsynapse":
			initDatatable( 'postsynapse', this.id );
			break;
		}
		return;
	}
	
	this.hideToolbars = function()
	{
		document.getElementById( "toolbar_nav" ).style.display = "none";
		document.getElementById( "toolbar_text" ).style.display = "none";
		document.getElementById( "toolbar_crop" ).style.display = "none";
		document.getElementById( "toolbar_trace" ).style.display = "none";
	}
	
	
	this.setTool = function( newTool )
	{
		tool = newTool;
		if ( !self.focusedStack )
			self.focusedStack = stacks[ 0 ];
		
		self.focusedStack.setTool( tool );
		window.onresize();
		return;
	}
	
	
	this.toggleShow = function( m )
	{
		switch ( m )
		{
		case "text":
			if ( show_textlabels && mode != "text" )
			{
				show_textlabels = false;
				document.getElementById( "show_button_text" ).className = "button";
				for ( var i = 0; i < stacks.length; ++i )
					stacks[ i ].showTextlabels( false );
			}
			else
			{
				show_textlabels = true;
				for ( var i = 0; i < stacks.length; ++i )
					stacks[ i ].showTextlabels( true );
				document.getElementById( "show_button_text" ).className = "button_active";
			}
		}
		return;
	}
	
	/**
	 * register all GUI elements
	 */
	this.register = function()
	{
		document.getElementById( "content" ).style.display = "none";
		document.body.appendChild( view );
		ui.registerEvent( "onresize", resize );
		window.onresize();
		
		document.onkeydown = onkeydown;
		
		return;
	}
	
	/**
	 * unregister and remove all stacks, free the event-handlers, hide the stack-toolbar
	 *
	 * @todo: should not the stack handle the navigation toolbar?
	 */
	this.unregister = function()
	{
		if ( tool ) tool.unregister();
		
		//! close all windows
		rootWindow.close();
			
		ui.removeEvent( "onresize", resize );
		try
		{
			document.body.removeChild( view );
		}
		catch ( error ) {}
		self.id = 0;
		document.onkeydown = null;
		document.getElementById( "content" ).style.display = "block";
		
		project = null;

		return;
	}
	
	/**
	 * set the project to be editable or not
	 */
	this.setEditable = function(bool)
	{
		editable = bool;
		if (editable) {
			document.getElementById("toolbox_edit").style.display = "block";
			document.getElementById("toolbox_data").style.display = "block";
		}
		else 
		{
			document.getElementById("toolbox_edit").style.display = "none";
			document.getElementById("toolbox_data").style.display = "none";
		}
		window.onresize();
		
		return;
	}
	
	/**
	 * move all stacks to the physical coordinates
	 */
	this.moveTo = function(
		zp,
		yp,
		xp,
		sp )
	{
		self.coordinates.x = xp;
		self.coordinates.y = yp;
		self.coordinates.z = zp;
		
		for ( var i = 0; i < stacks.length; ++i )
		{
			stacks[ i ].moveTo( zp, yp, xp, sp );
		}
		return;
	}
	
	/**
	 * create a URL to the current view
	 */
	this.createURL = function()
	{
		var coords;
		var url="?pid=" + self.id;
		if ( stacks.length > 0 )
		{
			//coords = stacks[ 0 ].projectCoordinates();		//!< @todo get this from the SELECTED stack to avoid approximation errors!
			url += "&zp=" + self.coordinates.z + "&yp=" + self.coordinates.y + "&xp=" + self.coordinates.x;
			for ( var i = 0; i < stacks.length; ++i )
			{
				url += "&sid" + i + "=" + stacks[ i ].id + "&s" + i + "=" + stacks[ i ].s;
			}
		}
		return url;
	}
	
	/**
	 * create a textlabel on the server
	 */
	this.createTextlabel = function( tlx, tly, tlz, tlr, scale )
	{
		icon_text_apply.style.display = "block";
		requestQueue.register(
			'model/textlabel.create.php',
			'POST',
			{
				pid : project.id,
				x : tlx,
				y : tly,
				z : tlz,
				r : parseInt( document.getElementById( "fontcolourred" ).value ) / 255,
				g : parseInt( document.getElementById( "fontcolourgreen" ).value ) / 255,
				b : parseInt( document.getElementById( "fontcolourblue" ).value ) / 255,
				a : 1,
				type : "text",
				scaling : ( document.getElementById( "fontscaling" ).checked ? 1 : 0 ),
				fontsize : ( document.getElementById( "fontscaling" ).checked ?
							Math.max( 16 / scale, parseInt( document.getElementById( "fontsize" ).value ) ) :
							parseInt( document.getElementById( "fontsize" ).value ) ) * tlr,
				fontstyle : ( document.getElementById( "fontstylebold" ).checked ? "bold" : "" )
			},
			function( status, text, xml )
			{
				statusBar.replaceLast( text );
				
				if ( status == 200 )
				{
					icon_text_apply.style.display = "none";
					for ( var i = 0; i < stacks.length; ++i )
					{
						stacks[ i ].updateTextlabels();
					}
					if ( text && text != " " )
					{
						var e = eval( "(" + text + ")" );
						if ( e.error )
						{
							alert( e.error );
						}
						else
						{
						}
					}
				}
				return true;
			} );
		return;
	}
	
	var onkeydown = function( e )
	{
		var key;
		var target;
		var shift;
		var alt;
		var ctrl;
		if ( e )
		{
			if ( e.keyCode ) key = e.keyCode;
			else if ( e.charCode ) key = e.charCode;
			else key = e.which;
			target = e.target;
			shift = e.shiftKey;
			alt = e.altKey;
			ctrl = e.ctrlKey;
		}
		else if ( event && event.keyCode )
		{
			key = event.keyCode;
			target = event.srcElement;
			shift = event.shiftKey;
			alt = event.altKey;
			ctrl = event.ctrlKey;
		}
		var n = target.nodeName.toLowerCase();
		if ( !( n == "input" || n == "textarea" || n == "area" ) )		//!< @todo exclude all useful keyboard input elements e.g. contenteditable...
		{
			switch( key )
			{
			case 61:		//!< +
			case 107:
			case 187:		//!< for IE only---take care what this is in other platforms...
				slider_s.move( 1 );
				return false;
			case 109:		//!< -
			case 189:		//!< for IE only---take care what this is in other platforms...
				slider_s.move( -1 );
				return false;
			case 188:		//!< ,
				slider_z.move( -( shift ? 10 : 1 ) );
				return false;
			case 190:		//!< .
				slider_z.move( ( shift ? 10 : 1 ) );
				return false;
			case 37:		//!< cursor left
				input_x.value = parseInt( input_x.value ) - ( shift ? 100 : ( alt ? 1 : 10 ) );
				input_x.onchange( e );
				return false;
			case 39:		//!< cursor right
				input_x.value = parseInt( input_x.value ) + ( shift ? 100 : ( alt ? 1 : 10 ) );
				input_x.onchange( e );
				return false;
			case 38:		//!< cursor up
				input_y.value = parseInt( input_y.value ) - ( shift ? 100 : ( alt ? 1 : 10 ) );
				input_y.onchange( e );
				return false;
			case 40:		//!< cursor down
				input_y.value = parseInt( input_y.value ) + ( shift ? 100 : ( alt ? 1 : 10 ) );
				input_y.onchange( e );
				return false;
			case 9:			//!< tab
				if ( shift ) project.switchFocus( -1 );
				else project.switchFocus( 1 );
				//e.stopPropagation();
				return false;
			case 13:		//!< return
				break;
			/*
			default:
				alert( key );
			*/
			}
			return true;
		}
		else return true;
	}
	
	/**
	 * Get project ID.
	 */
	this.getId = function(){ return pid; }
	
	// initialise
	var self = this;
	this.id = pid;
	if ( typeof ui == "undefined" ) ui = new UI();
	if ( typeof requestQueue == "undefined" ) requestQueue = new RequestQueue();
	
	var tool = null;
	
	var rootWindow = new CMWRootNode();
	ui.registerEvent( "onresize", resize );
	
	var view = rootWindow.getFrame();
	view.className = "projectView";
	
	this.coordinates = 
	{
		x : 0,
		y : 0,
		z : 0
	};
	
	var template;				//!< DTD like abstract object tree (classes)
	var data;					//!< instances in a DOM representation
	
	var stacks = new Array();	//!< a list of stacks related to the project
	this.focusedStack;
	
	var editable = false;
	var mode = "move";
	var show_textlabels = true;
	
	var icon_text_apply = document.getElementById( "icon_text_apply" );
}
