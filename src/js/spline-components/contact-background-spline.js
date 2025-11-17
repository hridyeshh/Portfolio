/**
 * Contact Background Spline Demo - 3D scene as background element
 */
class ContactBackgroundSpline {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }
    
    this.splineScene = null;
    this.init();
  }

  init() {
    console.log('ContactBackgroundSpline: Starting initialization...');
    
    // Add loading indicator
    this.container.innerHTML = `
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        text-align: center;
        z-index: 1000;
        background: rgba(0,0,0,0.8);
        padding: 20px;
        border-radius: 10px;
      ">
        <h3>3D Background Loading...</h3>
        <p>Spline Runtime: ${typeof window.SplineRuntime !== 'undefined' ? '✅ Available' : '❌ Not Available'}</p>
        <div class="loader" style="margin: 10px auto;"></div>
      </div>
    `;
    
    // Create Spline scene for background
    this.splineScene = new SplineScene({
      scene: 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode',
      className: 'w-full h-full',
      onLoad: (spline) => {
        console.log('Contact background Spline scene loaded successfully', spline);
        // Clear loading indicator
        this.container.innerHTML = '';
        // You can interact with the Spline scene here if needed
        // For background, we typically don't need much interaction
      },
      onError: (error) => {
        console.error('Contact background Spline scene error:', error);
        // Show error message instead of hiding
        
        this.container.innerHTML = `
          <div style="color: white; text-align: center; padding: 2rem;">
            <p>3D Background failed to load</p>
            <p style="font-size: 0.8rem; opacity: 0.7;">${error.message}</p>
            <p style="font-size: 0.8rem; opacity: 0.7;">Spline Runtime: ${typeof window.SplineRuntime !== 'undefined' ? 'Available' : 'Not Available'}</p>
          </div>
        `;
      }
    });

    // Mount Spline to the background container and load
    this.splineScene.mount(this.container);
  }

  destroy() {
    if (this.splineScene) {
      this.splineScene.destroy();
    }
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContactBackgroundSpline;
}
