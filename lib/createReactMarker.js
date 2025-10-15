import { createRoot } from "react-dom/client";

export function createReactMarker(map, position, Component, onClick, HoverComponent, onHover) {
  class CustomMarker extends window.google.maps.OverlayView {
    constructor() {
      super();
      this.position = position;
      this.containerDiv = null;
      this.hoverDiv = null;
      this.root = null;
      this.hoverRoot = null;
      this.Component = Component;
      this.HoverComponent = HoverComponent;
    }

    updateComponent(newComponent) {
      this.Component = newComponent;
      if (this.root) {
        this.root.render(newComponent);
      }
    }

    onAdd() {
      this.containerDiv = document.createElement("div");
      this.containerDiv.style.position = "absolute";
      this.containerDiv.style.cursor = "pointer";

      this.root = createRoot(this.containerDiv);
      this.root.render(this.Component);

      // Add click listener if provided
      if (onClick) {
        this.containerDiv.addEventListener("click", onClick);
      }

      // Add hover functionality
      if (HoverComponent) {
        this.hoverDiv = document.createElement("div");
        this.hoverDiv.style.position = "absolute";
        this.hoverDiv.style.display = "none";
        this.hoverDiv.style.zIndex = "1000";

        this.hoverRoot = createRoot(this.hoverDiv);

        this.containerDiv.addEventListener("mouseenter", () => {
          this.hoverDiv.style.display = "block";
          this.hoverRoot.render(HoverComponent);
          if (onHover) onHover();
        });

        this.containerDiv.addEventListener("mouseleave", () => {
          this.hoverDiv.style.display = "none";
        });

        // Keep hover card visible when hovering over it
        this.hoverDiv.addEventListener("mouseenter", () => {
          this.hoverDiv.style.display = "block";
        });

        this.hoverDiv.addEventListener("mouseleave", () => {
          this.hoverDiv.style.display = "none";
        });

        // Add click listener to hover card
        if (onClick) {
          this.hoverDiv.addEventListener("click", onClick);
        }
      }

      const panes = this.getPanes();
      panes.overlayMouseTarget.appendChild(this.containerDiv);
      if (this.hoverDiv) {
        panes.floatPane.appendChild(this.hoverDiv);
      }
    }

    draw() {
      const overlayProjection = this.getProjection();
      const pos = overlayProjection.fromLatLngToDivPixel(
        new window.google.maps.LatLng(this.position.lat, this.position.lng)
      );

      if (this.containerDiv) {
        this.containerDiv.style.left = pos.x - 20 + "px"; // Center the pin (w-10 = 40px / 2 = 20px)
        this.containerDiv.style.top = pos.y - 20 + "px"; // Center the pin
      }

      if (this.hoverDiv) {
        this.hoverDiv.style.left = pos.x + 80 + "px"; // Position to the right of pill and red marker
        this.hoverDiv.style.top = pos.y - 40 + "px"; // Position slightly above pin
      }
    }

    onRemove() {
      if (this.containerDiv) {
        this.containerDiv.parentNode.removeChild(this.containerDiv);
        this.containerDiv = null;
      }
      if (this.hoverDiv) {
        this.hoverDiv.parentNode.removeChild(this.hoverDiv);
        this.hoverDiv = null;
      }
    }
  }

  const marker = new CustomMarker();
  marker.setMap(map);
  return marker;
}
