import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';


/**
 * 全选组件
 *      实现列表的全选功能，用户不需要管理复杂的逻辑。
 * API：
 *      outSelectItem：方法。输出被用户选中的选项。
 *      hasChecked: 属性。可由本地变量操作。使用情景：批量操作按钮的控制。
 * 使用方法：
 * 在ant的nz-table中的thead里，放入元素，如下所示：
 * <th nz-th nzCheckbox>
 *      <ag-all-check #agck [arrays]="_displayData"></ag-all-check>
 * </th>
 * 传入数据说明：
 * （本地变量）agck：可由用户自定义名称，定义后，需要和ag-item-check上的对应。
 * arrays：需要传入当前页面显示的数组。（如果nz-table是真分页，则直接将数据list传入即可，
 *         如果是假分页，则需要通过(nzDataChange)="_displayDataChange($event)"获取显示的数据。）
 * 在ag-all-check布置好后，用户需要在每个数据上放上ag-item-check元素，如下所示：
 * <td nz-td nzCheckbox>
 *      <ag-item-check [allCheck]="agck" [itemData]="data"></ag-item-check>
 * </td>
 * 传入数据说明：
 * allCheck：值为ag-all-check中定义的本地变量agck。
 * itemData：当前遍历的数据
 */
@Component({
    selector: 'ag-all-check',
    template: `
    <label nz-checkbox 
        [(ngModel)]="_allChecked" 
        [nzIndeterminate]="_indeterminate" (ngModelChange)="checkAll($event)"
        [nzDisabled]="allCheckIsDisabled">
        <ng-content></ng-content>
    </label>
    `
})
export class AgAllCheckComponent implements OnChanges, OnInit {

    /**
     * 数组
     */
    @Input()
    arrays: Array<any> = null;

    @Input()
    canCheckedProperty: Array<AgCanCheckProp> = null;
    /**
     * 选择方式
     * checkall: （默认）全部选中之后全选checkbox才被选中，
     * checkone: 只要有一个选中之后全选checkbox就会被选中
     */
    @Input()
    checkedWay: string = 'checkall';
    /**
     * 当checkedway === 'checkone'的时候
     * 如果全选checkbox也需要控制一个item的时候，可以通过这个属性传入item值以达到控制目的
     */
    @Input()
    itemData: any = null;
    _allChecked: boolean = null;

    _indeterminate: boolean = null;

    allCheckIsDisabled: boolean = null;
    /**
     * 选项中是否有被选中
     */
    hasChecked: boolean = this._allChecked || this._indeterminate;
    /**
     * 输出被选中的选项
     */
    @Output()
    outSelectItem = new EventEmitter<Array<any>>();
    ngOnInit() {
        console.log(this.checkedWay);
        this.refreshStatus();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.judgeAllCheckIsDisabled();
        // this._allChecked = false;
        // this._indeterminate = false;
        this.refreshStatus();
    }
    /**
     * 全选
     * @param $event event
     */
    checkAll($event) {
        if ($event) {
            this.arrays.forEach((data: any) => {
                this.setItemCheckValue(data, true);
            });
        } else {
            this.arrays.forEach(data => {
                this.setItemCheckValue(data, false);
            });
        }
        this.refreshStatus();
    }
    /**
     * 设置每一项的值
     * @param data 每一个item
     * @param check 状态
     */
    setItemCheckValue(data: any, check: boolean) {
        if (this.canCheckedProperty) {
            this.canCheckedProperty.forEach((v: AgCanCheckProp) => {
                if (data[v.canCheckPropName] === v.canCheckPropValue) {
                    data.checked = check;
                    return;
                }
            });
        } else {
            data.checked = check;
        }
    }
    /**
     * 刷新选择状态
     */
    refreshStatus() {
        setTimeout(() => {
            let unCheckedItemNums = 0;
            let allChecked = true;
            this.arrays.forEach((data: any) => {
                if (this.canCheckedProperty) {
                    let canChecked = false;
                    this.canCheckedProperty.forEach((v: AgCanCheckProp) => {
                        if (data[v.canCheckPropName] === v.canCheckPropValue) {
                            canChecked = true;
                            allChecked = allChecked && (data.checked === true);
                            return;
                        }
                    });
                    if (!canChecked) {
                        unCheckedItemNums++;
                    }
                } else {
                    allChecked = allChecked && (data.checked === true);
                }
            });
            let allUnChecked = true;
            this.arrays.forEach((data: any) => {
                if (this.canCheckedProperty) {
                    this.canCheckedProperty.forEach((v: AgCanCheckProp) => {
                        if (data[v.canCheckPropName] === v.canCheckPropValue) {
                            allUnChecked = allUnChecked && (data.checked !== true);
                            return;
                        }
                    });
                } else {
                    allUnChecked = allUnChecked && (data.checked !== true);
                }
            });
            this._allChecked = unCheckedItemNums < this.arrays.length ? allChecked : false;
            this._indeterminate = (!allChecked) && (!allUnChecked);
            this.hasChecked = this._allChecked || this._indeterminate;
            if (this.checkedWay === 'checkone' && this.itemData) {
                this.itemData.checked = this.hasChecked;
            }
            this.outSelectItem.emit(this.getCurrentSelectedItem());
        }, 1);
    }
    /**
     * 判断当前数组中是否全部不可选择
     */
    private judgeAllCheckIsDisabled() {
        let checkedItemNums = 0;
        if (this.canCheckedProperty) {
            this.arrays.forEach((data: any) => {
                this.canCheckedProperty.forEach((v: AgCanCheckProp) => {
                    if (data[v.canCheckPropName] === v.canCheckPropValue) {
                        checkedItemNums++;
                        return;
                    }
                });
            });
            if (checkedItemNums > 0) {
                this.allCheckIsDisabled = false;
            } else {
                this.allCheckIsDisabled = true;
            }
        } else {
            this.allCheckIsDisabled = false;
        }
    }
    /**
     * 得到当前选中的选项
     */
    private getCurrentSelectedItem(): Array<any> {
        const selectedItems: Array<any> = new Array();
        this.arrays.forEach((value: any) => {
            if (value.checked) {
                selectedItems.push(value);
            }
        });
        return selectedItems;
    }
}

export class AgCanCheckProp {
    /**
     * 能被选择的属性名
     */
    canCheckPropName: string = null;
    /**
     * 能被选择的属性的值
     */
    canCheckPropValue: any = null;

    constructor(canCheckPropName, canCheckPropValue) {
        this.canCheckPropName = canCheckPropName;
        this.canCheckPropValue = canCheckPropValue;
    }
}

