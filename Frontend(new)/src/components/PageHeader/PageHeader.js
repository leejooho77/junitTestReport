import React, {Component} from 'react';
import styles from './PageHeader.css'
import { Nav, Navbar, NavItem } from 'react-bootstrap';

class PageHeader extends Component {
    render(){
        return(
            <Navbar inverse collapseOnSelect className='header'>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="/">JUnit Test Module</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav pullRight>
                        <NavItem>
                            alpha:v4
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}
export default PageHeader

