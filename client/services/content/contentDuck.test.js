import nock from 'nock';
import { LIFECYCLE } from 'redux-pack';
import * as testHelpers from '../test/testHelpers';
import contentReducer, * as contentActionCreators from '../content/contentDuck';

const initialState = {
  isLoading: false,
  users: [],
};

describe('contentActionCreators', () => {
  const store = testHelpers.mockStore();

  afterEach(() => {
    nock.cleanAll();
    store.clearActions();
  });

  it('dispatches GET_TESTIMONIALS', async () => {
    const numberOfUsers = 3;
    const apiResult = { results: [{}, {}, {}] };

    nock('https://randomuser.me')
      .get('/api')
      .query({ results: numberOfUsers, inc: 'name,location,picture' })
      .reply(200, apiResult);

    const expectedActions = [
      testHelpers.makeReduxPackAction(LIFECYCLE.START, {
        type: 'GET_TESTIMONIALS',
      }),
      testHelpers.makeReduxPackAction(LIFECYCLE.SUCCESS, {
        type: 'GET_TESTIMONIALS',
        payload: apiResult,
        meta: { startPayload: undefined },
      }),
    ];

    await store.dispatch(contentActionCreators.getUsers(numberOfUsers));
    const dispatchedActions = store.getActions().map(testHelpers.removeReduxPackTransaction);

    expect(dispatchedActions).toEqual(expectedActions);
  });
});

describe('contentReducer', () => {
  it('returns intialState', () => {
    const finalState = contentReducer(undefined, {});
    const expectedState = initialState;
    expect(finalState).toEqual(expectedState);
  });

  it('sets users on GET_TESTIMONIALS:success', () => {
    const finalState = contentReducer(
      initialState,
      testHelpers.makeReduxPackAction(LIFECYCLE.SUCCESS, {
        type: 'GET_TESTIMONIALS',
        payload: { results: [{}, {}, {}] },
      }),
    );

    const expectedState = {
      ...initialState,
      users: [{}, {}, {}],
    };

    expect(finalState).toEqual(expectedState);
  });

  it('sets error on GET_TESTIMONIALS:failure', () => {
    const finalState = contentReducer(
      initialState,
      testHelpers.makeReduxPackAction(LIFECYCLE.FAILURE, {
        type: 'GET_TESTIMONIALS',
        payload: {
          error: {},
        },
      }),
    );

    const expectedState = {
      ...initialState,
      error: {},
    };

    expect(finalState).toEqual(expectedState);
  });
});
