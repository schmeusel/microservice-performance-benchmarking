import React from 'react';
import { shallow } from 'enzyme';
import Downloads from '../../../../../src/webServer/public/components/downloads/Downloads';
import { PHASES } from '../../../../../src/webServer/public/constants/ApplicationConstants';
import EndpointConstants from '../../../../../src/webServer/public/constants/EndpointConstants';

describe('Test Downloads', () => {
    it('should render a PaperContainer with the "Downloads" heading', () => {
        const wrapper = shallow(<Downloads phase={PHASES.VALUES.INITIALIZATION} patterns={[]} />);
        expect(wrapper.is('PaperContainer'))
            .toBeTruthy();
        expect(wrapper.prop('heading'))
            .toEqual('Downloads');
    });

    it('should render a DownloadLinkContainer for "Events"', () => {
        const wrapper = shallow(<Downloads phase={PHASES.VALUES.INITIALIZATION} patterns={[]} />);
        expect(wrapper.childAt(0)
            .childAt(0)
            .is('DownloadLinkContainer'))
            .toBeTruthy();
        expect(wrapper.childAt(0)
            .childAt(0)
            .prop('heading'))
            .toEqual('Events');
        expect(wrapper.childAt(0)
            .childAt(0)
            .childAt(0)
            .is('a'))
            .toBeTruthy();
        expect(wrapper.childAt(0)
            .childAt(0)
            .childAt(0)
            .prop('href'))
            .toEqual(EndpointConstants.DOWNLOAD_LOG.path('systemEvents'));
    });

    it('should render a "Workloads" container if the phase comes after workload generation', () => {
        const patternsStub = [{ name: 'pattern1' }, { name: 'pattern2' }];
        const wrapperWithWorkloads = shallow(
            <Downloads
                phase={PHASES.VALUES.REQUEST_TRANSMISSION}
                patterns={patternsStub}
            />,
        );
        expect(wrapperWithWorkloads.find('DownloadLinkContainer'))
            .toHaveLength(2);
        expect(wrapperWithWorkloads.find('DownloadLinkContainer')
            .at(1)
            .prop('heading'))
            .toEqual('Workloads');
        expect(wrapperWithWorkloads.find('DownloadLinkContainer')
            .at(1)
            .children())
            .toHaveLength(patternsStub.length);
        wrapperWithWorkloads.find('DownloadLinkContainer')
            .at(1)
            .children()
            .forEach((child, i) => {
                expect(child.is('a'))
                    .toBeTruthy();
                expect(child.prop('href'))
                    .toEqual(EndpointConstants.DOWNLOAD_WORKLOAD.path(patternsStub[i].name));
            });
    });

    it('should not render a workloads container if the current phase indicates that workloads have not been generated yet', () => {
        const patternsStub = [{ name: 'pattern1' }, { name: 'pattern2' }];
        const wrapper = shallow(
            <Downloads
                phase={PHASES.VALUES.PATTERN_RESOLUTION}
                patterns={patternsStub}
            />,
        );
        expect(wrapper.find('Downloads[heading="Workloads"]'))
            .toHaveLength(0);
    });

    it('should render a measurements container if the current phase indicates that all requests have been sent yet', () => {
        const patternsStub = [{ name: 'pattern1' }, { name: 'pattern2' }];
        const wrapper = shallow(
            <Downloads
                phase={PHASES.VALUES.MEASUREMENT_EVALUATION}
                patterns={patternsStub}
            />,
        );
        expect(wrapper.find('DownloadLinkContainer[heading="Measurements"]'))
            .toHaveLength(1);
        expect(wrapper.find('DownloadLinkContainer[heading="Measurements"]')
            .childAt(0)
            .is('a'))
            .toBeTruthy();
        expect(wrapper.find('DownloadLinkContainer[heading="Measurements"]')
            .childAt(0)
            .prop('href'))
            .toEqual(EndpointConstants.DOWNLOAD_LOG.path('measurements'));
    });

    it('should not render a measurements container if the current phase indicates that not all measurements have been made yet', () => {
        const patternsStub = [{ name: 'pattern1' }, { name: 'pattern2' }];
        const wrapper = shallow(
            <Downloads
                phase={PHASES.VALUES.REQUEST_TRANSMISSION}
                patterns={patternsStub}
            />,
        );
        expect(wrapper.find('DownloadLinkContainer[heading="Measurements"]'))
            .toHaveLength(0);
    });
});
