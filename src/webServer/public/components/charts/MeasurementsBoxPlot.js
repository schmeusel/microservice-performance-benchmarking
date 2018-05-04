import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { fade } from 'material-ui/utils/colorManipulator';
import { Palette } from '../../constants/Theme';
import 'chartjs-chart-box-and-violin-plot';
import 'chart.js';

export default class MeasurementsBoxPlot extends PureComponent {
    static propTypes = {
        patternName: PropTypes.string.isRequired,
        measurements: PropTypes.objectOf(
            PropTypes.shape({
                operation: PropTypes.oneOf(['READ', 'UPDATE', 'SCAN', 'DELETE', 'CREATE']).isRequired,
                latencies: PropTypes.shape({
                    error: PropTypes.arrayOf(PropTypes.number).isRequired,
                    success: PropTypes.arrayOf(PropTypes.number).isRequired
                }).isRequired
            })
        ).isRequired
    };

    constructor(props) {
        super(props);
        this.chart = null;
    }

    componentDidMount() {
        const ctx = document.getElementById(this.props.patternName).getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'boxplot',
            data: this.getChartsData(this.props),
            options: this.getChartOptions(this.props)
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.chart) {
            this.chart.data = this.getChartsData(nextProps);
            this.chart.options = this.getChartOptions(nextProps);
            this.chart.update();
        }
    }

    getChartsData(props) {
        const { measurements } = props;
        const latencies = Object.keys(measurements).map(index => measurements[index].latencies);

        return {
            labels: Object.keys(measurements).map(round => `#${round}`),
            datasets: [
                {
                    label: 'Erroneous Requests',
                    backgroundColor: fade(Palette.accent1Color, 0.3),
                    borderColor: Palette.accent1Color,
                    borderWidth: 1,
                    data: latencies.map(errAndSuccess => errAndSuccess.error.map(num => parseFloat(num.toFixed(2)))),
                    padding: 20
                },
                {
                    label: 'Successful Requests',
                    backgroundColor: fade(Palette.primary1Color, 0.3),
                    borderColor: Palette.primary1Color,
                    borderWidth: 1,
                    data: latencies.map(errAndSuccess => errAndSuccess.success.map(num => parseFloat(num.toFixed(2)))),
                    padding: 20
                }
            ]
        };
    }

    getChartOptions(props) {
        return {
            responsive: true,
            legend: {
                position: 'top',
                labels: {
                    defaultFontFamily: "'Roboto', sans-serif"
                }
            },
            scales: {
                yAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Latency [ms]'
                        },
                        ticks: {
                            suggestedMin: 180,
                            suggestedMax: 280
                        }
                    }
                ],
                xAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Sequence Step'
                        }
                    }
                ]
            }
        };
    }

    render() {
        return <canvas id={this.props.patternName} />;
    }
}
