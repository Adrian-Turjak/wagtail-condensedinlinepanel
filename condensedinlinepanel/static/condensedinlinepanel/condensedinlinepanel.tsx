import {createStore} from 'redux';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {Form} from './types';
import {reducer, State} from './state';
import {DraggableCard} from './components/Card';
import {DNDCardSet} from './components/CardSet';


export {DraggableCard as Card, DNDCardSet as CardSet, reducer};


interface Options {
    canEdit?: boolean,
    canDelete?: boolean,
    canOrder?: boolean,
    summaryTextField?: string,
}


export function init(id: string, options: Options = {}) {
    const canEdit = options['canEdit'] || true;
    const canDelete = options['canDelete'] || canEdit;
    const canOrder = options['canOrder'] || false;
    const summaryTextField = options['summaryTextField'];

    let element = document.getElementById(id);
    let totalFormsField = document.getElementById(id + '-TOTAL_FORMS');
    let dataField = element.getElementsByClassName('condensed-inline-panel__data')[0];
    let sortOrderField = element.getElementsByClassName('condensed-inline-panel__sort-order')[0];
    let uiContainer = element.getElementsByClassName('condensed-inline-panel__ui-container')[0];

    let store = createStore(reducer);

    let sortCompareFunc = (a: Form, b: Form) => {
        if (a.position > b.position) {
            return 1;
        } else if (a.position < b.position) {
            return -1;
        } else {
            return 0;
        }
    };

    // Rerender component when state changes
    store.subscribe(() => {
        let state: State = JSON.parse(store.getState());
        ReactDOM.render(<DNDCardSet forms={state.forms}
                                 summaryTextField={summaryTextField}
                                 canEdit={canEdit}
                                 canDelete={canDelete}
                                 canOrder={canOrder}
                                 store={store}
                                 emptyForm={state.emptyForm}
                                 formTemplate={element.dataset['formTemplate']}
                                 formsetPrefix={id}
                                 sortCompareFunc={sortCompareFunc} />, uiContainer);
    });

    // Keep sort order field up to date
    if (canOrder) {
        let sortOrderField = element.getElementsByClassName('condensed-inline-panel__sort-order')[0];
        store.subscribe(() => {
            let state: State = JSON.parse(store.getState());
            let sortOrders = [];

            for (let i = 0; i< state.forms.length; i++) {
                sortOrders.push(state.forms[i].position);
            }

            if (sortOrderField instanceof HTMLInputElement) {
                sortOrderField.value = JSON.stringify(sortOrders);
            }
        });
    }

    // Keep delete field up to date
    let deleteField = element.getElementsByClassName('condensed-inline-panel__delete')[0];
    store.subscribe(() => {
        let state: State = JSON.parse(store.getState());
        let deletedForms = [];

        for (let i = 0; i< state.forms.length; i++) {
            if (state.forms[i].isDeleted) {
                deletedForms.push(state.forms[i].id);
            }
        }

        if (deleteField instanceof HTMLInputElement) {
            deleteField.value = JSON.stringify(deletedForms);
        }
    });

    // Set initial state
    if (dataField instanceof HTMLInputElement) {
        store.dispatch({
            type: 'SET_STATE',
            state: dataField.value,
        });
    }

    // Update TOTAL_FORMS when the number of forms changes
    store.subscribe(() => {
        let state: State = JSON.parse(store.getState());

        if (totalFormsField instanceof HTMLInputElement) {
            totalFormsField.value = state.forms.length.toString();
        }
    });
}