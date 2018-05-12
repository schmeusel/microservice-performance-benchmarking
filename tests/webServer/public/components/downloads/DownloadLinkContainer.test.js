import React from 'react';
import { shallow } from 'enzyme';
import DownloadLinkContainer from '../../../../../src/webServer/public/components/downloads/DownloadLinkContainer';

describe('Test DownloadLinkContainer', () => {
    describe('render()', () => {
        it('should render a container with a heading and its children', () => {
            const headingStub = 'Test';
            const wrapper = shallow(
                <DownloadLinkContainer heading={headingStub}>
                    <span>child</span>
                </DownloadLinkContainer>,
            );
            expect(wrapper.is('div')).toBeTruthy();
            expect(wrapper.find('div').prop('style')).toEqual({
                display: 'flex',
                flexDirection: 'column',
                marginBottom: 8,
                marginRight: 16,
            });
            expect(wrapper.childAt(0).is('h4')).toBeTruthy();
            expect(wrapper.find('h4')).toHaveLength(1);
            expect(wrapper.find('h4').text()).toEqual(headingStub);
        });

        it('should return null if it does not have children', () => {
            const wrapper = shallow(<DownloadLinkContainer heading={'Test'} />);
            expect(wrapper.type()).toBeNull();
        });
    });
});
