var infoArea = {
    float: 'left',
    clear: 'both'
};
var infoItem = {
    float: 'left',
    maxWidth: 460,
    minWidth: 320,
    height: 55,
    lineHeight: 4,
    borderBottom: '1px dashed #aaa',
    marginLeft: 35
};
var infoSpan = {
    float: 'left',
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold'
};
var infoInput = {
    float: 'right',
    maxWidth: 220,
    height: 35,
    border: '1px solid #fff',
    borderRadius: 5,
    textIndent: 15,
    marginTop: 10,
    backgroundColor: '#fff'
};
var infoBtn = {
    float: 'right',
    margin: 30
};
var btnStyle = {
    float: 'right',
    width: 55,
    height: 35,
    lineHeight: 2.5,
    textAlign: 'center',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: 5,
    margin: '0 5px',
    cursor: 'pointer'
};

//EDIT FORM ORIGINAL STATUS
var parentEditStatus = null;
var originalValue = [];

var InfoBox = React.createClass({
    loadDataFormServer: function () {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function (data) {
                this.setState({data: data});
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        })
    },
    sendToServer: function (text) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: text,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function () {
        return {data: [],edit: true}
    },
    componentDidMount: function () {
        this.loadDataFormServer();
    },
    handleSubmit: function (e,text) {
        e.preventDefault();
        this.sendToServer(text);
        //实时性（可优化）
        this.loadDataFormServer();
    },
    render: function () {
        return (
            <div className="InfoBox">
                <form className="infoForm" onSubmit={this.handleSubmit}>
                    <InfoBtn infoSendToServerBtn={this.handleSubmit} />
                    <InfoArea data={this.state.data} />
                </form>
            </div>
        )
    }
});
var InfoArea = React.createClass({
   render: function () {
       var infoNodes = this.props.data.map(function (obj) {
            return (
                <InfoItem title={obj.title} text={obj.text} key={obj.id}> </InfoItem>
            )
       });
       return (
           <div className="infoArea" style={infoArea}>
               {infoNodes}
           </div>
       )
   }
});
var InfoItem = React.createClass({
    getInitialState: function () {
        return {title: this.props.title,text: this.props.text}
    },
    handleTextChange: function (e) {
        //EDIT OR NOT
        if (parentEditStatus) {
            this.setState({text: e.target.value});
        } else {
            this.setState({text: this.state.text});
        }
    },
    render: function () {
        return (
            <div className="infoItem" style={infoItem}>
                <span style={infoSpan}>{this.props.title}：</span>
                <input type="text" value={this.state.text} onChange={this.handleTextChange} name="text" style={infoInput} />
            </div>
        )
    }
});

var InfoBtn = React.createClass({
    getInitialState: function () {
        return ({editBtn: true})
    },
    handleDefaultBtn: function (e) {
        e.preventDefault();
        this.setState({editBtn: !this.state.editBtn});
        parentEditStatus = null;
        $("input").css({"background-color": "#fff"});
    },
    handleEditState: function (e) {
        this.setState({editBtn: !this.state.editBtn});
        parentEditStatus = true;
        var inputNodesList = $("input[type='text']");
        inputNodesList.css({"background-color": "#f0f0f0"});
        inputNodesList[0].focus();
        for (var i = 0; i < inputNodesList.length; i++ ) {
            originalValue[i] = $(inputNodesList[i]).val();
        }
    },
    handleCancelState: function (e) {
        this.handleDefaultBtn(e);
        parentEditStatus = null;
        var inputNodeList = $("input[type='text']");
        inputNodeList.css({"background-color": "#fff"});
        //cancel button code;
        for (var i = 0; i < inputNodeList.length; i++ ) {
            $(inputNodeList[i]).val(originalValue[i]);
        }
    },
    handleSaveState: function (e) {
        this.handleDefaultBtn(e);
        //save to db  code
        var inputNodeList = $("input[type='text']");
        var modifyValue = [];
        var jsonModifyValue = {};
        for (var i = 0; i < inputNodeList.length; i++) {
            jsonModifyValue[i] = $(inputNodeList[i]).val();
        }
        jsonModifyValue = JSON.stringify(jsonModifyValue);
        this.props.infoSendToServerBtn(e,{"text": jsonModifyValue});
    },
   render: function () {
       var editStatus = this.state.editBtn;
       if (editStatus) {
           return (
               <div class="infoBtn" style={infoBtn}>
                   <input type="button" value="编辑" style={btnStyle} onClick={this.handleEditState} />
               </div>
           )
       } else {
           return (
               <div class="infoBtn" style={infoBtn}>
                   <input type="button" value="取消" style={btnStyle} onClick={this.handleCancelState} />
                   <input type="submit" value="保存" style={btnStyle} onClick={this.handleSaveState} />
               </div>
           )
       }

   }
});

ReactDOM.render(
    <InfoBox url="/api/comments" />,
    document.getElementById("content")
);



