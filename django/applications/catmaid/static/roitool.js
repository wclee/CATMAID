/**
 * roitool.js
 *
 * requirements:
 *   tools.js
 *	 boxselectiontool.js
 *
 */

/**
 * The constructor for the region of interest (ROI) tool. It allows to draw a
 * box selection on the current view and to modify it with the help of text
 * boxes in a tool bar.
 */
function RoiTool()
{
    // call super constructor
    BoxSelectionTool.call( this )

    var self = this;
    this.toolname = "roitool";

	if ( !ui ) ui = new UI();

	// inputs for x, y, width and height of the crop box
	this.box_roi_x = document.getElementById( "box_roi_x" );
	this.box_roi_y = document.getElementById( "box_roi_y" );
	this.box_roi_w = document.getElementById( "box_roi_w" );
	this.box_roi_h = document.getElementById( "box_roi_h" );

	//! mouse catcher
	this.mouseCatcher = document.createElement( "div" );
	this.mouseCatcher.className = "sliceMouseCatcher";
	this.mouseCatcher.style.cursor = "default";

    this.button_roi_apply = document.getElementById( "button_roi_apply" );

    // bind event handlers to current calling context
    this.onmousedown_bound = this.onmousedown.bind(this);
    this.onmouseup_bound = this.onmouseup.bind(this);
    this.onmousemove_pos_bound = this.onmousemove.pos.bind(this);
    this.onmousemove_crop_bound = this.onmousemove.crop.bind(this);
};

// Let the RoiTool inherit from the BoxSelectionTool
extend( RoiTool, BoxSelectionTool );

/**
 * Updates UI elements like the the crop box input boxes.
 */
RoiTool.prototype.updateControls = function()
{
    var cb = this.getCropBox();
    if ( cb )
    {
        var roiBoxBB = this.getCropBoxBoundingBox(cb.stack);
        this.box_roi_x.value = isNaN(roiBoxBB.left_px) ? "-" : roiBoxBB.left_px;
        this.box_roi_y.value = isNaN(roiBoxBB.top_px) ? "-" : roiBoxBB.top_px;
        this.box_roi_w.value = isNaN(roiBoxBB.width_px) ? "-" : roiBoxBB.width_px;
        this.box_roi_h.value = isNaN(roiBoxBB.height_px) ? "-" : roiBoxBB.height_px;
    }

    return;
};

/**
 * Handles redraw events and calls the redraw method of the base class and
 * triggers an update of UI elements.
 */
RoiTool.prototype.redraw = function()
{
    // call register of super class
    RoiTool.superproto.redraw.call( this );
    this.updateControls();
};

/**
 * Handles resize events by adjusting the mouse catcher.
 */
RoiTool.prototype.resize = function( width, height )
{
    this.mouseCatcher.style.width = width + "px";
    this.mouseCatcher.style.height = height + "px";
    return;
};

/**
 * Handles onchange events in the X input box.
 */
RoiTool.prototype.changeCropBoxXByInput = function( e )
{
    var val = parseInt( this.box_roi_x.value );
    var cropBox = this.getCropBox();

    if ( isNaN( val ) )
    {
        this.value = this.toPx( cropBox.left, this.stack.resolution.x );
    }
    else
    {
        var screen_left = this.getScreenLeft(this.stack);
        var width_world = cropBox.right - cropBox.left;
        cropBox.left = this.toWorld( val, this.stack.resolution.x ) + screen_left;
        cropBox.right = cropBox.left + width_world;
        this.updateCropBox();
        this.updateControls();
    }
    return;
};

/**
 * Handles onchange events in the Y input box.
 */
RoiTool.prototype.changeCropBoxYByInput = function( e )
{
    var val = parseInt( this.box_roi_y.value );
    var cropBox = this.getCropBox();

    if ( isNaN( val ) )
    {
        this.value = this.toPx( cropBox.left, this.stack.resolution.y );
    }
    else
    {
        var screen_top = this.getScreenTop(this.stack);
        var height_world = cropBox.bottom - cropBox.top;
        cropBox.top = this.toWorld( val, this.stack.resolution.y ) + screen_top;
        cropBox.bottom = cropBox.top + height_world;
        this.updateCropBox();
        this.updateControls();
    }
    return;
};

/**
 * Handles onchange events in the width input box.
 */
RoiTool.prototype.changeCropBoxWByInput = function( e )
{
    var val = parseInt( this.box_roi_w.value );
    var cropBox = this.getCropBox();

    if ( isNaN( val ) )
    {
        var width_world = cropBox.right - cropBox.left;
        this.value = this.toPx( width_world, this.stack.resolution.x );
    }
    else
    {
        var width_world = this.toWorld( val, this.stack.resolution.x );
        cropBox.right = cropBox.left + width_world;
        this.updateCropBox();
        this.updateControls();
    }
    return;
};

/**
 * Handles onchange events in the height input box.
 */
RoiTool.prototype.changeCropBoxHByInput = function( e )
{
    var val = parseInt( this.box_roi_h.value );
    var cropBox = this.getCropBox();

    if ( isNaN( val ) )
    {
        var height_world = cropBox.bottom - cropBox.top;
        this.value = this.toPx( height_world, this.stack.resolution.y );
    }
    else
    {
        var height_world = this.toWorld( val, this.stack.resolution.y );
        cropBox.bottom = cropBox.top + height_world;
        this.updateCropBox();
        this.updateControls();
    }
    return;
};

/**
 * Handles mouse wheel changes in text input boxes.
 */
RoiTool.prototype.cropBoxMouseWheel = function( e )
{
    var w = ui.getMouseWheel( e );
    if ( w )
    {
        this.value = parseInt( this.value ) - w;
        this.onchange();
    }
    return false
};

/**
 * Handles mousedown events.
 */
RoiTool.prototype.onmousedown = function( e )
{
    var b = ui.getMouseButton( e );
    switch ( b )
    {
    case 2:
        ui.removeEvent( "onmousemove", this.onmousemove_crop_bound );
        ui.removeEvent( "onmouseup", this.onmouseup_bound );
        break;
    default:
        var m = ui.getMouse( e, this.stack.getView() );
        this.createCropBox( m.offsetX, m.offsetY );

        ui.registerEvent( "onmousemove", this.onmousemove_crop_bound );
        ui.registerEvent( "onmouseup", this.onmouseup_bound );
        ui.catchEvents( "crosshair" );
    }
    ui.onmousedown( e );

    //! this is a dirty trick to remove the focus from input elements when clicking the stack views, assumes, that document.body.firstChild is an empty and useless <a></a>
    document.body.firstChild.focus();

    return false;
};

/**
 * Keeps two mousemove event handlers. The first (pos) shown the current
 * position in the status line and the second one (crop) adjusts the crop box
 * while moving.
 */
RoiTool.prototype.onmousemove = {
    pos : function ( e )
    {
        var xp;
        var yp;
        var m = ui.getMouse( e, this.stack.getView() );
        if ( m )
        {
            var s = this.stack;
            var pos_x = s.translation.x + ( s.x + ( m.offsetX - s.viewWidth / 2 ) / s.scale ) * s.resolution.x;
            var pos_y = s.translation.x + ( s.y + ( m.offsetY - s.viewHeight / 2 ) / s.scale ) * s.resolution.y;
            statusBar.replaceLast( "[" + this.convertWorld( pos_x ).toFixed( 3 ) + ", " + this.convertWorld( pos_y ).toFixed( 3 ) + "]" );
        }
        return false;
    },
    crop : function( e )
    {
        var cropBox = this.getCropBox();

        if ( cropBox )
        {
            // adjust left and rigt component
            cropBox.xdist += ui.diffX;
            var xdist_world = this.toWorld( cropBox.xdist, this.stack.resolution.x );
            if ( cropBox.xdist > 0 )
            {
                cropBox.left = cropBox.xorigin;
                cropBox.right = cropBox.xorigin + xdist_world;
            }
            else
            {
                cropBox.left = cropBox.xorigin + xdist_world;
                cropBox.right = cropBox.xorigin;
            }

            // adjust top and bottom component
            cropBox.ydist += ui.diffY;
            var ydist_world = this.toWorld( cropBox.ydist, this.stack.resolution.y );
            if ( cropBox.ydist > 0 )
            {
                cropBox.top = cropBox.yorigin;
                cropBox.bottom = cropBox.yorigin + ydist_world;
            }
            else
            {
                cropBox.top = cropBox.yorigin + ydist_world;
                cropBox.bottom = cropBox.yorigin;
            }

            this.updateCropBox();
        }
        this.updateControls();
    }
};

RoiTool.prototype.onmouseup = function ( e )
{
    ui.releaseEvents();
    ui.removeEvent( "onmousemove", this.onmousemove_crop_bound );
    ui.removeEvent( "onmouseup", this.onmouseup_bound );
    this.updateControls();
};

RoiTool.prototype.onmousewheel = function( e )
{

};

/**
 * Adds a mouse wheel listener to a component.
 */
RoiTool.prototype.addMousewheelListener = function( component, handler )
{
    try
    {
        component.addEventListener( "DOMMouseScroll", handler, false );
    }
    catch ( error )
    {
        try
        {
            component.onmousewheel = handler;
        }
        catch ( error ) {}
    }
};

/**
 * Removes a mouse wheel listener from a component.
 */
RoiTool.prototype.removeMousewheelListener = function( component, handler )
{
    try
    {
        component.removeEventListener( "DOMMouseScroll", handler, false );
    }
    catch ( error )
    {
        try
        {
            component.onmousewheel = null;
        }
        catch ( error ) {}
    }
};

/**
 * Installs this tool in a stack and registers all GUI control elements and
 * event handlers.
 */
RoiTool.prototype.register = function( parentStack )
{
    // call register of super class (updates also stack member)
    RoiTool.superproto.register.call( this, parentStack );

    // initialize the stacks we offer to crop
    var project = this.stack.getProject();

    this.mouseCatcher.style.cursor = "crosshair";
    // create and remember mouse bindings, bound to the
    // current context (this).
    this.mouseCatcher.onmousedown = this.onmousedown_bound;
    this.mouseCatcher.onmousemove = this.onmousemove_pos_bound;

    var onmousewheel = this.onmousewheel.bind(this);
    try
    {
        this.mouseCatcher.addEventListener( "DOMMouseScroll", onmousewheel, false );
        /* Webkit takes the event but does not understand it ... */
        this.mouseCatcher.addEventListener( "mousewheel", onmousewheel, false );
    }
    catch ( error )
    {
        try
        {
            this.mouseCatcher.onmousewheel = onmousewheel;
        }
        catch ( error ) {}
    }

    this.stack.getView().appendChild( this.mouseCatcher );

    var cropBoxMouseWheel = this.cropBoxMouseWheel.bind(this);
    this.box_roi_x.onchange = this.changeCropBoxXByInput.bind(this);
    this.addMousewheelListener( this.box_roi_x, this.cropBoxMouseWheel );
    this.box_roi_y.onchange = this.changeCropBoxYByInput.bind(this);
    this.addMousewheelListener( this.box_roi_y, this.cropBoxMouseWheel );
    this.box_roi_w.onchange = this.changeCropBoxWByInput.bind(this);
    this.addMousewheelListener( this.box_roi_w, this.cropBoxMouseWheel );
    this.box_roi_h.onchange = this.changeCropBoxHByInput.bind(this);
    this.addMousewheelListener( this.box_roi_h, this.cropBoxMouseWheel );

    // initialize crop button
    //this.button_roi_apply.onclick = crop;

    document.getElementById( "toolbar_roi" ).style.display = "block";

    this.updateControls();

    return;
};

/**
 * Unregisters all stack related mouse and keyboard controls.
 */
RoiTool.prototype.unregister = function()
{
    if ( this.stack && this.mouseCatcher.parentNode == this.stack.getView() )
        this.stack.getView().removeChild( this.mouseCatcher );

    return;
};

/**
 * Unregisters all project related GUI control connections and event
 * handlers, toggle off tool activity signals (like buttons).
 */
RoiTool.prototype.destroy = function()
{
    this.unregister();

    document.getElementById( "toolbar_roi" ).style.display = "none";

    this.box_roi_x.onchange = null;
    this.removeMousewheelListener( this.box_roi_x, this.cropBoxMouseWheel );
    this.box_roi_y.onchange = null;
    this.removeMousewheelListener( this.box_roi_y, this.cropBoxMouseWheel );
    this.box_roi_w.onchange = null;
    this.removeMousewheelListener( this.box_roi_w, this.cropBoxMouseWheel );
    this.box_roi_h.onchange = null;
    this.removeMousewheelListener( this.box_roi_h, this.cropBoxMouseWheel );

    this.button_roi_apply.onclick = null;

    // call destroy of super class
    RoiTool.superproto.destroy.call( this );

    return;
};

/**
 * This function should return true if there was any action linked to the key
 * code, or false otherwise.
 */
RoiTool.prototype.handleKeyPress = function( e ) {
    return false;
};

