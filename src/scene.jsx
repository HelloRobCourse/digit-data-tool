import React from "react";

/*******************
 *   WHOLE PAGE
 *******************/

class SceneView extends React.Component {
  constructor(props) {
    super(props);

    // React state.
    this.state = {
      step: 0,
      img_states: Array.from({ length: 10 }).map((_, i) => "empty"),
      status: "Incomplete",
      is_valid: false,
    };

    this.pix = 28;
    this.ctx = [];
    this.canvases = [];
    for (let i = 0; i < 10; i++) {
      this.canvases.push(React.createRef());
    }

    this.current_img = 0;
  }

  componentDidMount() {
    this.ctx = [];
    for (let i = 0; i < 10; i++) {
      console.log(this.canvases[i]);
      this.ctx.push(this.canvases[i].current.getContext('2d'));
    }
  }

  /*****************************
   *  COMPONENT EVENT HANDLERS
   *****************************/

  resetImages(e) {
    for (let i = 0; i < 10; i++) {
      this.ctx[i].clearRect(0, 0, this.pix, this.pix);
    }
    this.current_img = 0;

    this.setState({img_states: Array.from({ length: 10 }).map((_, i) => "empty"),
                   is_valid: false,
                   status: "Incomplete"})
  }

  handleDragOver(e) {
    e.preventDefault();
  }

  handleDrop(e) {
    e.preventDefault();

    if (e.dataTransfer.items) {
      if (e.dataTransfer.items.length + this.current_img > 10) {
        alert("You uploaded " + e.dataTransfer.items.length + " files! Maximum number of images is 10.");
      }
      else {
        var new_states = this.state.img_states.slice();
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          var valid = true;
          if (e.dataTransfer.items[i].kind === 'file') {
            valid = this.drawImageFromFile(e.dataTransfer.items[i], this.current_img);
            this.current_img += 1;
          }
          else {
            valid = false;
          }
          if (!valid) new_states[i] = "invalid";
        }
        this.setState({img_states : new_states});
      }
    }
  }

  drawImageFromFile(file, idx) {
    var valid = true;
    var file = file.getAsFile();
    var reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = (event) => {
        var new_states = this.state.img_states.slice();
        if (img.width !== img.height) {
          valid = false;
          console.log("img", idx, "invalid")
          new_states[idx] = "invalid";
        }
        else {
          new_states[idx] = "valid";
        }

        this.ctx[idx].drawImage(img, 0, 0, this.pix, this.pix);
        let imgData = this.ctx[idx].getImageData(0, 0, this.pix, this.pix);
        imgData = this.makeGrayscaleImage(imgData);
        this.ctx[idx].putImageData(imgData, 0, 0);

        let is_valid = new_states.every( v => v === "valid" );
        let status = is_valid ? "Complete" : "Incomplete";

        this.setState({img_states : new_states, status: status, is_valid: is_valid});
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);

    return valid;
  }

  makeGrayscaleImage(imgData) {
    for (let i = 0; i < imgData.data.length; i += 4) {
      let count = imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2];
      let colour = 0;
      if (count > 510) colour = 255;
      else if (count > 255) colour = 127.5;

      imgData.data[i] = colour;
      imgData.data[i + 1] = colour;
      imgData.data[i + 2] = colour;
      imgData.data[i + 3] = 255;
    }
    return imgData;
  }

  render() {
    const indices = Array.from({ length: 10 }).map((_, i) => i);
    let status_class = this.state.is_valid ? "valid" : "invalid";

    return (
      <div>

        <div className="drop-imgs" onDragOver={(e) => this.handleDragOver(e)} onDrop={(e) => this.handleDrop(e)}>
          <p>Drag and drop your images here to upload.</p>
        </div>

        <div className="row">
        <div className="img-container">
          <button className="button" onClick={(e) => this.resetImages(e)}>
            Reset Images
          </button>

          <table className="img-table">
            <tbody>
              {[Array(2).fill().map((_, i) =>
                  <tr key={ i } >
                    { indices.slice(i * 5, (i + 1) * 5).map(idx =>
                      <td key={ "canvas" + idx } className={this.state.img_states[idx]}
                          onDragOver={(e) => this.handleDragOver(e)} onDrop={(e) => this.handleDrop(e, idx)}>
                        <canvas ref={this.canvases[idx]} id={"canvas" + idx}
                                width={this.pix} height={this.pix}></canvas>
                      </td>
                    )}
                  </tr>
              )]
              }</tbody>
          </table>
        </div>
        </div>

        <div className="status-wrapper">
          <span className={"status " + status_class}>{this.state.status}</span>
        </div>
      </div>
    );
  }
}

export default SceneView;
