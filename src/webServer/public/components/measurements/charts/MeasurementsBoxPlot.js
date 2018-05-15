import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { fade } from 'material-ui/utils/colorManipulator';
import * as stats from 'simple-statistics';
import 'chartjs-chart-box-and-violin-plot';
import Chart from 'chart.js';
import { Palette } from '../../../constants/Theme';
import { MeasurementsPropTypes } from '../../../constants/CustomPropTypes';

export default class MeasurementsBoxPlot extends PureComponent {
    static propTypes = {
        patternName: PropTypes.string.isRequired,
        measurements: PropTypes.objectOf(MeasurementsPropTypes).isRequired,
    };

    constructor(props) {
        super(props);
        this.chart = null;
        this.canvasId = `${props.patternName}_boxplot`;
    }

    componentDidMount() {
        const ctx = document.getElementById(this.canvasId).getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'boxplot',
            data: this.getChartsData(this.props),
            options: this.getChartOptions(this.props),
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.chart) {
            this.chart.data = this.getChartsData(nextProps);
            this.chart.options = this.getChartOptions();
            this.chart.update();
        }
    }

    getChartsData(props) {
        const { measurements } = props;
        const latencies = Object.keys(measurements).map(index => measurements[index].latencies);

        return {
            labels: Object.keys(measurements).map(round => `#${parseInt(round) + 1}`),
            datasets: [
                {
                    label: 'Erroneous Requests',
                    backgroundColor: fade(Palette.accent1Color, 0.3),
                    borderColor: Palette.accent1Color,
                    borderWidth: 1,
                    data: latencies.map(errAndSuccess => errAndSuccess.error.map(num => parseFloat(num.toFixed(2)))),
                    padding: 20,
                },
                {
                    label: 'Successful Requests',
                    backgroundColor: fade(Palette.primary1Color, 0.3),
                    borderColor: Palette.primary1Color,
                    borderWidth: 1,
                    data: latencies.map(errAndSuccess => errAndSuccess.success.map(num => parseFloat(num.toFixed(2)))),
                    padding: 20,
                },
            ],
        };
    }

    getChartOptions() {
        return {
            responsive: true,
            legend: {
                position: 'top',
                labels: {
                    defaultFontFamily: '\'Roboto\', sans-serif',
                },
            },
            tooltips: {
                callbacks: {
                    title: item => `Sequence Step ${item[0].xLabel}`,
                    afterLabel: (item, data) => {
                        const latencies = data.datasets[item.datasetIndex].data[item.index];
                        const min = stats.min(latencies).toFixed(2);
                        const q1 = stats.quantile(latencies, 0.25).toFixed(2);
                        const mean = stats.mean(latencies).toFixed(2);
                        const q3 = stats.quantile(latencies, 0.75).toFixed(2);
                        const max = stats.max(latencies).toFixed(2);
                        return [
                            '',
                            `Min:\t${min}`,
                            `Q1:\t${q1}ms`,
                            `Mean:\t${mean}ms`,
                            `Q3:\t${q3}ms`,
                            `Max:\t${max}ms`,
                        ];
                    },
                    label: (item, data) => data.datasets[item.datasetIndex].label,
                },
            },
            scales: {
                yAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Latency [ms]',
                            fontStyle: 'bold',
                        },
                        ticks: {
                            suggestedMin: 180,
                            suggestedMax: 280,
                            fontSize: 10,
                        },
                    },
                ],
                xAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Sequence Step',
                            fontStyle: 'bold',
                        },
                        ticks: {
                            fontSize: 10,
                        },
                    },
                ],
            },
        };
    }

    render() {
        return (
            <Fragment>
                <h4>Box Plots</h4>
                <canvas id={this.canvasId} />
            </Fragment>
        );
    }
}
