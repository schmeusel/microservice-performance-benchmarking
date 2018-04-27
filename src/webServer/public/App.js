import React, { Component } from 'react';

class App extends Component {
    constructor() {
        super();
        this.state = {
            wasDecisionMade: false,
            responseMessage: undefined
        };
        this.handleDecision = this.handleDecision.bind(this);
    }

    handleDecision(result) {
        return () => {
            fetch(`/end/${result}`)
                .then(res => console.log(res) || res.json())
                .then(data => {
                    this.setState({
                        wasDecisionMade: true,
                        responseMessage: data.message
                    });
                })
                .catch(err => {
                    console.log('err from api', err);
                    this.setState({
                        wasDecisionMade: true,
                        responseMessage: err.message
                    });
                });
        };
    }

    render() {
        return (
            <div>
                <h2>Experiment Run</h2>
                <button onClick={this.handleDecision('succeed')}>Succeed</button>
                <button onClick={this.handleDecision('fail')}>Fail</button>
                {this.state.wasDecisionMade ? this.state.responseMessage : null}
            </div>
        );
    }
}

export default App;
