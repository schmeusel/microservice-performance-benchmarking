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
        this.state = {
            withJitterPoints: true,
        };
        this.successDataset = {
            label: 'Successful Requests',
            backgroundColor: fade(Palette.primary1Color, 0.3),
            borderColor: Palette.primary1Color,
            borderWidth: 1,
            padding: 20,
        };
        this.errorDataset = {
            label: 'Erroneous Requests',
            backgroundColor: fade(Palette.accent1Color, 0.3),
            borderColor: Palette.accent1Color,
            borderWidth: 1,
            padding: 20,
        };
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
        this.updateChart(nextProps);
    }

    getDataSeries(withJitterPoints, latencies, type) {
        if (withJitterPoints) {
            return latencies
                .map(errAndSuccess => errAndSuccess[type].map(num => parseFloat(num.toFixed(2))));
        }
        return latencies
            .map(errAndSuccess => ({
                min: errAndSuccess[type].length ? stats.min(errAndSuccess[type]) : NaN,
                max: errAndSuccess[type].length ? stats.max(errAndSuccess[type]) : NaN,
                q1: errAndSuccess[type].length ? stats.quantile(errAndSuccess[type], 0.25) : NaN,
                q3: errAndSuccess[type].length ? stats.quantile(errAndSuccess[type], 0.75) : NaN,
                median: errAndSuccess[type].length ? stats.median(errAndSuccess[type]) : NaN,
            }));
    }

    getChartsData(props) {
        const { measurements } = props;
        const latencies = Object.keys(measurements).map(index => measurements[index].latencies);

        const successSeries = this.getDataSeries(this.state.withJitterPoints, latencies, 'success');
        const errorSeries = this.getDataSeries(this.state.withJitterPoints, latencies, 'error');
        const datasets = [];

        if (this.shouldIncludeDataSeries(successSeries, this.state.withJitterPoints)) {
            datasets.push({
                ...this.successDataset,
                data: successSeries,
            });
        }

        if (this.shouldIncludeDataSeries(errorSeries, this.state.withJitterPoints)) {
            datasets.push({
                ...this.errorDataset,
                data: errorSeries,
            });
        }

        return {
            labels: Object.keys(measurements).map(round => `#${parseInt(round) + 1}`),
            datasets,
        };
    }

    getSuggestedMinMax(measurements) {
        const latencies = Object
            .keys(measurements)
            .map(step => measurements[step].latencies)
            .reduce((totalLatencies, errAndSuccess) => [
                ...totalLatencies,
                ...errAndSuccess.success,
                ...errAndSuccess.error,
            ], []);
        const min = Math.min(...latencies);
        const max = Math.max(...latencies);

        const clearance = 0.02;

        return {
            suggestedMin: Math.round(min) * (1 - clearance),
            suggestedMax: Math.round(max) * (1 + clearance),
        };
    }

    getAfterLabel(withJitterPoints) {
        return (item, data) => {
            const result = {};
            const relevantData = data.datasets[item.datasetIndex].data[item.index];
            if (withJitterPoints) {
                result.min = stats.min(relevantData).toFixed(2);
                result.q1 = stats.quantile(relevantData, 0.25).toFixed(2);
                result.median = stats.median(relevantData).toFixed(2);
                result.q3 = stats.quantile(relevantData, 0.75).toFixed(2);
                result.max = stats.max(relevantData).toFixed(2);
            } else {
                result.min = relevantData.min;
                result.q1 = relevantData.q1;
                result.median = relevantData.median;
                result.q3 = relevantData.q3;
                result.max = relevantData.max;
            }
            return [
                '',
                `Min:\t${result.min}ms`,
                `Q1:\t${result.q1}ms`,
                `Median:\t${result.median}ms`,
                `Q3:\t${result.q3}ms`,
                `Max:\t${result.max}ms`,
            ];
        };
    }

    getChartOptions(props) {
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
                    afterLabel: this.getAfterLabel(this.state.withJitterPoints),
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
                            ...this.getSuggestedMinMax(props.measurements),
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

    shouldIncludeDataSeries(series, withJitterPoints) {
        if (withJitterPoints) {
            return series.reduce((hasLength, curr) => hasLength || !!curr.length, false);
        }

        return Object.keys(series).reduce((isNumber, stat) => isNumber && !!series[stat], true);
    }

    updateChart(props) {
        if (this.chart) {
            this.chart.data = this.getChartsData(props);
            this.chart.options = this.getChartOptions(props);
            this.chart.update();
        }
    }

    render() {
        return (
            <Fragment>
                <h4>Box Plots</h4>
                <button onClick={e => this.setState(({ withJitterPoints }) => ({ withJitterPoints: !withJitterPoints }), () => this.updateChart(this.props))}>Toggle
                    Jitter
                </button>
                <canvas id={this.canvasId} />
            </Fragment>
        );
    }
}
