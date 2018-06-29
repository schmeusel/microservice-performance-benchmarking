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
        const ctx = document.getElementById(this.canvasId)
            .getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'boxplot',
            data: this.getChartsData(this.props),
            options: this.getChartOptions(this.props),
        });
    }

    componentWillReceiveProps(nextProps) {
        this.updateChart(nextProps);
    }

    getDataSeries(latencies, type) {
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
        const latencies = Object.keys(measurements)
            .map(index => measurements[index].latencies);

        const successSeries = this.getDataSeries(latencies, 'success');
        const errorSeries = this.getDataSeries(latencies, 'error');

        return {
            labels: Object.keys(measurements)
                .map(round => `#${parseInt(round) + 1}`),
            datasets: [
                ...(
                    this.shouldIncludeDataSeries(successSeries)
                        ? [{
                            ...this.successDataset,
                            data: successSeries,
                        }]
                        : []
                ),
                ...(
                    this.shouldIncludeDataSeries(errorSeries)
                        ? [{
                            ...this.errorDataset,
                            data: errorSeries,
                        }]
                        : []
                ),
            ],
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
        if (!latencies.length) {
            return {
                suggestedMin: 0,
                suggestedMax: 0,
            };
        }

        const min = Math.min(...latencies);
        const max = Math.max(...latencies);
        const q1 = stats.quantile(latencies, 0.25);
        const q3 = stats.quantile(latencies, 0.75);
        const iqr = q3 - q1;
        const whiskerMin = Math.max(min, q1 - iqr);
        const whiskerMax = Math.min(max, q3 + iqr);
        const clearance = 0.02;

        return {
            suggestedMin: Math.round(whiskerMin) * (1 - clearance),
            suggestedMax: Math.round(whiskerMax) * (1 + clearance),
        };
    }

    getAfterLabel(item, data) {
        const relevantData = data.datasets[item.datasetIndex].data[item.index];
        return [
            '',
            `Min:\t${relevantData.min.toFixed(2)}ms`,
            `Q1:\t${relevantData.q1.toFixed(2)}ms`,
            `Median:\t${relevantData.median.toFixed(2)}ms`,
            `Q3:\t${relevantData.q3.toFixed(2)}ms`,
            `Max:\t${relevantData.max.toFixed(2)}ms`,
        ];
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
                    afterLabel: this.getAfterLabel,
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

    shouldIncludeDataSeries(series) {
        return series
            .map(serie => Object.keys(serie)
                .reduce((valid, stat) => valid && !!serie[stat], true))
            .reduce((valid, curr) => valid || curr, false);
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
                <canvas id={this.canvasId} />
            </Fragment>
        );
    }
}
